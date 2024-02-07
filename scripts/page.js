/* ------------- Winter 2024 EECS 493 Assignment 3 Starter Code ------------ */

/* ------------------------ GLOBAL HELPER VARAIBLES ------------------------ */
// Difficulty Helpers
let astProjectileSpeed = 3; // easy: 1, norm: 3, hard: 5

// Game Object Helpers
let currentAsteroid = 1;
const AST_OBJECT_REFRESH_RATE = 15;
const maxPersonPosX = 1218;
const maxPersonPosY = 658;
const PERSON_SPEED = 5; // #pixels each time player moves by
const portalOccurrence = 15000; // portal spawns every 15 seconds
const portalGone = 5000; // portal disappears in 5 seconds
const shieldOccurrence = 10000; // shield spawns every 10 seconds
const shieldGone = 5000; // shield disappears in 5 seconds

// Movement Helpers
let LEFT = false;
let RIGHT = false;
let UP = false;
let DOWN = false;

// TODO: ADD YOUR GLOBAL HELPER VARIABLES (IF NEEDED)

/* --------------------------------- MAIN ---------------------------------- */
$(document).ready(function () {
  // jQuery selectors
  game_window = $(".game-window");
  game_screen = $("#actual-game");
  asteroid_section = $(".asteroidSection");
  // hide all other pages initially except landing page

  game_screen.hide();
  game_screen.removeClass("hide");

  /* -------------------- ASSIGNMENT 2 SELECTORS BEGIN -------------------- */
  $(".difficulty-button").on("click", changeDifficulty);
  $("#settings-button").on("click", showSettings);
  $("#close").on("click", closeSettings);
  $("#play-button").on("click", showTutorial);
  $("#slider-container").on("click", volumeChange);

  /* --------------------- ASSIGNMENT 2 SELECTORS END --------------------- */

  // TODO: DEFINE YOUR JQUERY SELECTORS (FOR ASSIGNMENT 3) HERE
  $("#start").on("click", startGame);

  // Example: Spawn an asteroid that travels from one border to another
  // spawn(); // Uncomment me to test out the effect!
});

/* ---------------------------- EVENT HANDLERS ----------------------------- */
// Keydown event handler
document.onkeydown = function (e) {
  if (e.key == "ArrowLeft") LEFT = true;
  if (e.key == "ArrowRight") RIGHT = true;
  if (e.key == "ArrowUp") UP = true;
  if (e.key == "ArrowDown") DOWN = true;
};

// Keyup event handler
document.onkeyup = function (e) {
  if (e.key == "ArrowLeft") LEFT = false;
  if (e.key == "ArrowRight") RIGHT = false;
  if (e.key == "ArrowUp") UP = false;
  if (e.key == "ArrowDown") DOWN = false;
};

/* ------------------ ASSIGNMENT 2 EVENT HANDLERS BEGIN ------------------ */
let page = "landing";
let difficulty = "normal";

function changeDifficulty() {
  const thisDifficulty = $(this).attr("id");
  if (difficulty === thisDifficulty) {
    return;
  }
  $(`#${difficulty}`).removeClass("selected");
  $(this).addClass("selected");
  difficulty = thisDifficulty;
}

function showSettings() {
  if (page === "landing") {
    $("#settings").removeClass("hide");
    page = "settings";
  } else {
    return;
  }
}

function closeSettings() {
  if (page === "settings") {
    $("#settings").addClass("hide");
    page = "landing";
  } else {
    return;
  }
}

function showTutorial() {
  if (page === "landing") {
    $("#landing").addClass("hide");
    $("#tutorial").removeClass("hide");
    page = "tutorial";
  } else {
    return;
  }
}

function volumeChange() {
  const volume = $("#volume").val();
  $("#volume-output").html("Volume: " + volume);
}

/* ------------------- ASSIGNMENT 2 EVENT HANDLERS END ------------------- */

// TODO: ADD MORE FUNCTIONS OR EVENT HANDLERS (FOR ASSIGNMENT 3) HERE

function startGame() {
  console.log("KEYPRESS");
  game_screen.show();
  $("#tutorial").hide();
  setTimeout(() => {
    $("#get-ready").hide();
    
    // TODO transition to game
  }, 3000);
}

/* ---------------------------- GAME FUNCTIONS ----------------------------- */
// Starter Code for randomly generating and moving an asteroid on screen
class Asteroid {
  // constructs an Asteroid object
  constructor() {
    /*------------------------Public Member Variables------------------------*/
    // create a new Asteroid div and append it to DOM so it can be modified later
    let objectString =
      "<div id = 'a-" +
      currentAsteroid +
      "' class = 'curAsteroid' > <img src = 'src/asteroid.png'/></div>";
    asteroid_section.append(objectString);
    // select id of this Asteroid
    this.id = $("#a-" + currentAsteroid);
    currentAsteroid++; // ensure each Asteroid has its own id
    // current x, y position of this Asteroid
    this.cur_x = 0; // number of pixels from right
    this.cur_y = 0; // number of pixels from top

    /*------------------------Private Member Variables------------------------*/
    // member variables for how to move the Asteroid
    this.x_dest = 0;
    this.y_dest = 0;
    // member variables indicating when the Asteroid has reached the boarder
    this.hide_axis = "x";
    this.hide_after = 0;
    this.sign_of_switch = "neg";
    // spawn an Asteroid at a random location on a random side of the board
    this.#spawnAsteroid();
  }

  // Requires: called by the user
  // Modifies:
  // Effects: return true if current Asteroid has reached its destination, i.e., it should now disappear
  //          return false otherwise
  hasReachedEnd() {
    if (this.hide_axis == "x") {
      if (this.sign_of_switch == "pos") {
        if (this.cur_x > this.hide_after) {
          return true;
        }
      } else {
        if (this.cur_x < this.hide_after) {
          return true;
        }
      }
    } else {
      if (this.sign_of_switch == "pos") {
        if (this.cur_y > this.hide_after) {
          return true;
        }
      } else {
        if (this.cur_y < this.hide_after) {
          return true;
        }
      }
    }
    return false;
  }

  // Requires: called by the user
  // Modifies: cur_y, cur_x
  // Effects: move this Asteroid 1 unit in its designated direction
  updatePosition() {
    // ensures all asteroids travel at current level's speed
    this.cur_y += this.y_dest * astProjectileSpeed;
    this.cur_x += this.x_dest * astProjectileSpeed;
    // update asteroid's css position
    this.id.css("top", this.cur_y);
    this.id.css("right", this.cur_x);
  }

  // Requires: this method should ONLY be called by the constructor
  // Modifies: cur_x, cur_y, x_dest, y_dest, num_ticks, hide_axis, hide_after, sign_of_switch
  // Effects: randomly determines an appropriate starting/ending location for this Asteroid
  //          all asteroids travel at the same speed
  #spawnAsteroid() {
    // REMARK: YOU DO NOT NEED TO KNOW HOW THIS METHOD'S SOURCE CODE WORKS
    let x = getRandomNumber(0, 1280);
    let y = getRandomNumber(0, 720);
    let floor = 784;
    let ceiling = -64;
    let left = 1344;
    let right = -64;
    let major_axis = Math.floor(getRandomNumber(0, 2));
    let minor_aix = Math.floor(getRandomNumber(0, 2));
    let num_ticks;

    if (major_axis == 0 && minor_aix == 0) {
      this.cur_y = floor;
      this.cur_x = x;
      let bottomOfScreen = game_screen.height();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = game_screen.width() - x;
      this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-0.5, 0.5);
      this.y_dest = -astProjectileSpeed - getRandomNumber(0, 0.5);
      this.hide_axis = "y";
      this.hide_after = -64;
      this.sign_of_switch = "neg";
    }
    if (major_axis == 0 && minor_aix == 1) {
      this.cur_y = ceiling;
      this.cur_x = x;
      let bottomOfScreen = game_screen.height();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = game_screen.width() - x;
      this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-0.5, 0.5);
      this.y_dest = astProjectileSpeed + getRandomNumber(0, 0.5);
      this.hide_axis = "y";
      this.hide_after = 784;
      this.sign_of_switch = "pos";
    }
    if (major_axis == 1 && minor_aix == 0) {
      this.cur_y = y;
      this.cur_x = left;
      let bottomOfScreen = game_screen.width();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = -astProjectileSpeed - getRandomNumber(0, 0.5);
      this.y_dest = game_screen.height() - y;
      this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-0.5, 0.5);
      this.hide_axis = "x";
      this.hide_after = -64;
      this.sign_of_switch = "neg";
    }
    if (major_axis == 1 && minor_aix == 1) {
      this.cur_y = y;
      this.cur_x = right;
      let bottomOfScreen = game_screen.width();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = astProjectileSpeed + getRandomNumber(0, 0.5);
      this.y_dest = game_screen.height() - y;
      this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-0.5, 0.5);
      this.hide_axis = "x";
      this.hide_after = 1344;
      this.sign_of_switch = "pos";
    }
    // show this Asteroid's initial position on screen
    this.id.css("top", this.cur_y);
    this.id.css("right", this.cur_x);
    // normalize the speed s.t. all Asteroids travel at the same speed
    let speed = Math.sqrt(
      this.x_dest * this.x_dest + this.y_dest * this.y_dest
    );
    this.x_dest = this.x_dest / speed;
    this.y_dest = this.y_dest / speed;
  }
}

// Spawns an asteroid travelling from one border to another
function spawn() {
  let asteroid = new Asteroid();
  setTimeout(spawn_helper(asteroid), 0);
}

function spawn_helper(asteroid) {
  let astermovement = setInterval(function () {
    // update Asteroid position on screen
    asteroid.updatePosition();
    // determine whether Asteroid has reached its end position
    if (asteroid.hasReachedEnd()) {
      // i.e. outside the game boarder
      asteroid.id.remove();
      clearInterval(astermovement);
    }
  }, AST_OBJECT_REFRESH_RATE);
}

/* --------------------- Additional Utility Functions  --------------------- */
// Are two elements currently colliding?
function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

// Will two elements collide soon?
// Input: Two elements, upcoming change in position for the moving element
function willCollide(o1, o2, o1_xChange, o1_yChange) {
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Are two elements colliding or will they collide soon?
// Input: Two elements, upcoming change in position for the moving element
// Use example: isOrWillCollide(paradeFloat2, person, FLOAT_SPEED, 0)
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange) {
  const o1D = {
    left: o1.offset().left + o1_xChange,
    right: o1.offset().left + o1.width() + o1_xChange,
    top: o1.offset().top + o1_yChange,
    bottom: o1.offset().top + o1.height() + o1_yChange,
  };
  const o2D = {
    left: o2.offset().left,
    right: o2.offset().left + o2.width(),
    top: o2.offset().top,
    bottom: o2.offset().top + o2.height(),
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (
    o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top
  ) {
    // collision detected!
    return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
