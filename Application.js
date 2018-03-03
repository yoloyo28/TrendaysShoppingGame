javascript: (
  function () {
    let points = 0;

    let isMoving = false;
    let isRotating = false;
    let canShoot = true;

    let playerX = 800;
    let playerY = 100;
    let playerRotation = 180;

    /* Player Creation */
    let playerContainer = document.createElement("div");
    playerContainer.style.position = "fixed";
    playerContainer.style.top = playerY + "px";
    playerContainer.style.left = playerX + "px";
    playerContainer.style.fontSize = "54px";
    playerContainer.style.transform = `rotate(${playerRotation}deg)`;
    playerContainer.className = "text-greensea";

    let playerImg = document.createElement("i");
    playerImg.className = "icon-trendays-logo";

    playerContainer.appendChild(playerImg);

    /* Play Zone Initialization */
    let feedContainer = document.getElementById("tds-feed-container");
    feedContainer.appendChild(playerContainer);
    feedContainer.style.paddingTop = "800px";
    feedContainer.removeAttribute("class");

    let pointsLabel = document.createElement("div");
    pointsLabel.style.position = "absolute";
    pointsLabel.style.left = "47%";
    pointsLabel.style.fontSize = "30px";
    pointsLabel.className = "text-red";
    pointsLabel.innerHTML = `${points} points`;
    document.getElementById("main-navbar").appendChild(pointsLabel);


    function calculateMoveDirection(rotationDirection) {
      let isGoingLeft = rotationDirection > 180 && rotationDirection < 360;
      let isGoingUp = rotationDirection > 270 || rotationDirection < 90;

      let rotation = rotationDirection;
      let valueX = 0;
      let valueY = 0;

      if (isGoingLeft) {
        rotation = rotationDirection - 180;
      }

      valueX = Math.abs((Math.abs((rotation / 90) - 1)) - 1);
      valueY = Math.abs((rotation / 90) - 1);

      if (isGoingLeft) {
        valueX = -valueX;
      }
      if (isGoingUp) {
        valueY = -valueY;
      }

      return { valueX, valueY };
    };

    /* Input Manager */
    let horizontalMovingId = null;
    let verticalMovingId = null;

    document.body.addEventListener("keydown", function onEvent(event) {
      if (!isRotating) {
        if (event.code == "KeyA") {
          horizontalMovingId = setInterval(frame, 5);
          function frame() {
            isRotating = true;
            --playerRotation;
            if (playerRotation <= 0) {
              playerRotation += 360;
            }
            playerContainer.style.transform = `rotate(${playerRotation}deg)`;
          }
        } else if (event.code == "KeyD") {
          horizontalMovingId = setInterval(frame, 5);
          function frame() {
            isRotating = true;
            ++playerRotation;
            if (playerRotation >= 360) {
              playerRotation -= 360;
            }
            playerContainer.style.transform = `rotate(${playerRotation}deg)`;
          }
        }
      }
      if (!isMoving) {
        if (event.code == "KeyW") {
          verticalMovingId = setInterval(frame, 5);
          function frame() {
            isMoving = true;

            let values = calculateMoveDirection(playerRotation);

            playerX += values.valueX * 2;
            playerContainer.style.left = playerX + 'px';

            if (values.valueY > 0 || playerY > 0) {
              playerY += values.valueY * 2;
              playerContainer.style.top = playerY + 'px';
            }
          }
        }
        if (event.code == "KeyS") {
          verticalMovingId = setInterval(frame, 5);
          function frame() {
            isMoving = true;

            let values = calculateMoveDirection(playerRotation);

            playerX -= values.valueX * 2;
            playerContainer.style.left = playerX + 'px';

            if (values.valueY < 0 || playerY > 0) {
              playerY -= values.valueY * 2;
              playerContainer.style.top = playerY + 'px';
            }
          }
        }
      }

      if (event.code == "Space") {
        if (canShoot) {
          canShoot = false;

          createBullet();

          setTimeout(shootTimeout, 20);
          function shootTimeout() {
            canShoot = true;
          }
        }
      }

      event.preventDefault();
    });

    document.body.addEventListener("keyup", function onEvent(event) {
      if (event.code == "KeyA" || event.code == "KeyD") {
        clearInterval(horizontalMovingId);
        /*isMoving = false;*/
        isRotating = false;
      }
      if (event.code == "KeyW" || event.code == "KeyS") {
        clearInterval(verticalMovingId);
        isMoving = false;
      }
    });

    /* Auto Scroll */
    let autoScrollId;

    function pageScroll() {
      window.scrollBy(0, 1);
      autoScrollId = setTimeout(pageScroll, 10);
    }

    if (true) pageScroll();


    /* Collision Check */
    function checkOverlap(firstElement) {
      let posts = feedContainer.getElementsByClassName("grid-item-3");

      let overlap = false;
      for (let i = 0; i < posts.length; i++) {
        let rect1 = firstElement.getBoundingClientRect();
        let rect2 = posts[i].getBoundingClientRect();
        overlap = !(rect1.right < rect2.left ||
          rect1.left > rect2.right ||
          rect1.bottom < rect2.top ||
          rect1.top > rect2.bottom);

        if (overlap) {
          return posts[i];
          break;
        }
      }

      return overlap;
    }

    /* Death Check */
    let deathCheckId;
    function checkDeath() {
      if (checkOverlap(playerContainer)) {
        clearTimeout(deathCheckId);
        clearTimeout(autoScrollId);
        clearTimeout(horizontalMovingId);
        clearTimeout(verticalMovingId);
        alert(`You Died. You finished with ${points} points!`);
      } else {
        deathCheckId = setTimeout(checkDeath, 500);
      }
    }
    checkDeath();


    /* Bullet Creation */
    function createBullet() {
      let bulletContainer = document.createElement("div");
      bulletContainer.style.position = "fixed";
      bulletContainer.style.top = (playerY + 50) + "px";
      bulletContainer.style.left = (playerX - 18) + "px";
      bulletContainer.style.fontSize = "24px";
      bulletContainer.style.transform = `rotate(${playerRotation + 90}deg)`;
      bulletContainer.className = "text-greensea";

      let bulletImg = document.createElement("i");
      bulletImg.className = "icon-trendays";

      bulletContainer.appendChild(bulletImg);
      feedContainer.appendChild(bulletContainer);

      const bulletRotation = playerRotation;

      let bulletMovingId = setInterval(bulletTrajectory, 10);
      function bulletTrajectory() {
        let bulletX = parseInt(bulletContainer.style.left, 10);
        let bulletY = parseInt(bulletContainer.style.top, 10);

        let values = calculateMoveDirection(bulletRotation);

        bulletX += values.valueX * 5;
        bulletContainer.style.left = bulletX + 'px';

        bulletY += values.valueY * 5;
        bulletContainer.style.top = bulletY + 'px';

        let collision = checkOverlap(bulletContainer);

        if (collision) {
          clearInterval(bulletMovingId);
          bulletContainer.remove();

          if (collision.style.opacity == "") collision.style.opacity = "1";

          let newOpacity = parseFloat(collision.style.opacity) - 0.25;

          if (newOpacity <= 0) {
            points += 10;
            pointsLabel.innerHTML = `${points} points`;
            collision.remove();
          } else {
            collision.style.opacity = newOpacity.toString();
          }
        }

        if (bulletY > 800 || bulletY < 0 || bulletX > 1500 || bulletX < 0) {
          clearInterval(bulletMovingId);
          bulletContainer.remove();
        }
      }
    }
  }
)();