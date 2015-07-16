$(function() {
  var FRAME_RATE = 25;
  var NUM_AGENTS = 50;
  var CONTROLS_WIDTH = 150;
  var ROUND;
  var AGENTS;
  var ALGORITHM = "Hybrid-Search";
  var ROUND_SPEED = 1000;

  // SUM MUST BE DIVISIBLE BY 4
  var SIZE = 30;
  var BORDER = 2;

  // MUST BE EVEN
  var IMG_WIDTH = 18;
  var IMG_HEIGHT = 18;

  var BOARD_WIDTH = Math.floor((window.innerWidth - (CONTROLS_WIDTH + 3*BORDER)) / (SIZE + BORDER));
  if (BOARD_WIDTH % 2 == 0) {
    BOARD_WIDTH -= 1;
  }
  var x_left = window.innerWidth - CONTROLS_WIDTH  - (BOARD_WIDTH * (SIZE + BORDER)) - BORDER;
  var BOARD_HEIGHT = Math.floor((window.innerHeight - BORDER) / (SIZE + BORDER));
  if (BOARD_HEIGHT % 2 == 0) {
    BOARD_HEIGHT -= 1;
  }
  var y_left = window.innerHeight - (BOARD_HEIGHT * (SIZE + BORDER)) - BORDER;

  var X_MAX = Math.ceil(BOARD_WIDTH/2);
  var X_MIN = -Math.floor((BOARD_WIDTH - 2)/2);
  var Y_MAX = Math.floor((BOARD_HEIGHT - 2)/2);
  var Y_MIN = -Math.ceil(BOARD_HEIGHT/2);
  console.log(X_MIN, X_MAX, Y_MIN, Y_MAX);


  $("table").css("margin-top", y_left/2 + "px");
  //$("#controls").css("height", window.innerHeight - y_left - 2*BORDER + "px");
  $("#controls").css("width", CONTROLS_WIDTH + "px");
  $("#controls").css("height", Math.min(532, window.innerHeight - 4) + "px");
  $("#controls").css("top", (window.innerHeight - $("#controls").height())/2 - 2);

  $("#cover_right").css("width", "100%")
                   .css("height", BOARD_HEIGHT * (SIZE + BORDER) + "px")
                   .css("left", BOARD_WIDTH * (SIZE + BORDER) + CONTROLS_WIDTH + BORDER*2 + "px");

  $("#cover_top").css("width", "100%")
                 .css("height", y_left/2 + BORDER)
                 .css("top", "0px");

  $("#cover_left").css("width", CONTROLS_WIDTH + 3*BORDER + "px")
                  .css("height", "100%")
                  .css("top", "0px");

  $("#cover_bottom").css("width", "100%")
                    .css("height", "100%")
                    .css("top", BOARD_HEIGHT * (SIZE + BORDER) + y_left/2);

  var table = $("#cells")

  for (var i = 0; i < BOARD_HEIGHT; i++) {
    var row = $("<tr>");
    for (var j = 0; j < BOARD_WIDTH; j++) {
      var col = $("<td>");
      col.addClass("cell");
      var x = j - (BOARD_WIDTH - 3)/2;
      var y = (BOARD_HEIGHT - 3)/2 - i;
      col.attr('id', x + "_" + y);
      col.css("width", SIZE);
      col.css("height", SIZE);
      if (i == (BOARD_HEIGHT - 3)/2 && j == (BOARD_WIDTH - 3)/2) {
        col.addClass("origin");
      }

      var num = $("<div>2</div>");
      num.addClass("num");
      //col.append(num);
      row.append(col);
    }
    table.append(row);
  }

  var flip_coin = function() {
    if (Math.random() < 0.5) {
      return "HEADS";
    } else {
      return "TAILS";
    }
  }

  var State = function() {};



  var delta_rectangle = function(s, alone, origin) {
    if (s.phase == "Separation") {
      delta_separation(s, alone, origin);
    }
    if (s.phase == "Allocation") {
      delta_allocation(s, alone, origin);
    }
    if (s.phase == "Search") {
      delta_search(s, alone, origin);
    }
  }

  var Move_rectangle = function(s) {
    if (s.phase == "Separation") {
      return Move_separation(s);
    } else if (s.phase == "Allocation") {
      return Move_allocation(s);
    } else if (s.phase == "Search") {
      return Move_search(s);
    }
  }

  var initialize_for_separation = function(s) {
    s.count = 0;
    s.back = false;
    s.even = false;
    s.coin = "HEADS";
  }

  var delta_separation = function(s, alone, origin) {
    s.coin = flip_coin();
    if (s.count < 2) {
      s.count = s.count + 1;
    }
    if (alone) {
      s.back = true;
    }
    s.even = !s.even;
    if (origin && s.back) {
      initialize_for_allocation(s);
      s.phase = "Allocation";
    }
  }

  var Move_separation = function(s) {
    if (s.count < 2) {
      return "West";
    } else if (s.even) {
      if (s.back) {
        return "East";  
      } else if (s.coin == "HEADS") {
        return "West";
      }
    }
  }

  var initialize_for_allocation = function(s) {
    s.part = "B";
    s.role = null;
    s.moves = ["East", "South", "East", "West", "South", "North", "West", "West"];
    s.count = 0;
    s.rounds = 0;
    s.shared = 0;
    s.first = false;
  }

  var delta_allocation = function(s, alone, origin) {
    if (s.role == null) {
      if (origin && alone && s.count == 0) {
        s.part = "A";
        s.moves = ["North", "East", "East", "South", "East", "South", "South", "West", "South", "West", "West", "North", "West", "North", "West", "East", "North", "East"];
      }
      if (alone) {
        if ((s.part == "A" && s.count == 1) || (s.part == "B" && s.count == 0)) {
          s.role = "North";
        } else if ((s.part == "A" && s.count == 5) || (s.part == "B" && s.count == 2)) {
          s.role = "East";
        } else if ((s.part == "A" && s.count == 9) || (s.part == "B" && s.count == 4)) {
          s.role = "South";
        } else if ((s.part == "A" && s.count == 13) || (s.part == "B" && s.count == 6)) {
          s.role = "West";
        } else if (s.part == "A" && s.count == 14) {
          s.role = "Explorer";
        }
      }
      if (s.part == "B" && s.count == 7) {
        s.role = "Explorer";
      }
      if (!origin || s.count == s.moves.length - 1) {
        s.count = s.count + 1;
      }
    }
    if (s.role != null) {
      delta_NESWX_allocation(s, alone, origin);
    }
  }

  var delta_NESWX_allocation = function(s, alone, origin) {
    if (s.part == "A") {
      if (alone) {
        s.shared = 0;
      } else {
        s.shared = s.shared + 1;
      }
      if (s.rounds > 0 || s.shared == 2) {
        s.rounds = s.rounds + 1;
      }
    } else if (s.part == "B") {
      if (!alone) {
        s.shared = s.shared + 1;
        if (s.rounds == 1 || s.rounds == 2) {
          s.first = true;
        }
      }
      if (s.rounds > 0 || (s.role == "North" && s.shared >= 4) || (s.role == "East" && s.shared >= 3) || (s.role == "South" && s.shared >= 2) || (s.role == "West" && s.shared >= 1) || (s.role == "Explorer")) {
        s.rounds = s.rounds + 1;
      }
    }
    if (s.rounds == 5 || (s.rounds == 3 && s.role == "Explorer")) {
      initialize_for_search(s);
      s.phase = "Search";
    }
  }

  var Move_allocation = function(s) {
    if (s.role == null && s.count < s.moves.length) {
      return s.moves[s.count];
    } else {
      if (s.part == "A") {
        if (s.role == "Explorer" && s.rounds == 2) {
          return "West";
        } else if (s.rounds >= 3) {
          return s.role;
        }
      } else if (s.part == "B") {
        if (s.role == "Explorer" && s.rounds >= 1) {
          return "West";
        } else if (s.role == "West" && s.rounds >= 2) {
          return "West"
        } else if ((s.role == "North" || s.role == "East" || s.role == "South") && (s.rounds == 1 || s.rounds >= 3)) {
          return s.role;
        }
      }

    }
  }

  var initialize_for_search = function(s) {
    s.status_ = "Between";
    s.found = false;
    s.wait = false;
    s.down = false;
    s.even = true;
    s.quad = 1;
    s.rounds = 0;
    s.shared = 0;
    s.count = 0;
  }

  var delta_search = function(s, alone, origin) {
    if (s.first) {
      s.first = false;
      s.even = false;
      s.status_ = "Exploring";
    }
    if (s.status_ == "Between") {
      if (!alone) {
        if (s.even) {
          s.found = true;
        } else {
          s.found = false;
        }
      } else if (s.found && s.even && alone) {
        s.found = false;
        s.wait = false;
        s.even = true;
        s.shared = 0;
        s.count = 0;
        s.status_ = "Exploring";
      }
      s.even = !s.even;
    }
    if (s.status_ == "Exploring") {
      if (s.role == "North" || s.role == "East" || s.role == "South") {
        delta_NES_search(s, alone, origin);
      } else if (s.role == "West") {
        delta_W_search(s, alone, origin);
      } else if (s.role == "Explorer") {
        delta_X_search(s, alone, origin);
      }
    }
  }

  var delta_NES_search = function(s, alone, origin) {
    if (!alone) {
      s.shared = s.shared + 1;
    } else {
      s.shared = 0;
    }
    if (s.shared == 3) {
      s.wait = true;
    }
    if (s.wait && alone) {
      s.status_ = "Between";
    }
  }

  var delta_W_search = function(s, alone, origin) {
    s.down = false;
    if (!alone && s.shared < 3) {
      s.shared = s.shared + 1;
      if (s.shared == 2) {
        s.down = true;
      }
    }
    if (s.count >= 2 && !s.wait) {
      if (alone) {
        s.status_ = "Between";
      } else {
        s.wait = false;
      }
    }
    if (alone) {
      s.wait = false;
    }
    if (s.shared == 3 || (s.count > 0 && s.count < 3)) {
      s.count = s.count + 1;
    }
  }

  var delta_X_search = function(s, alone, origin) {
    s.even = !s.even; 
    if (s.rounds < 4) {
      s.rounds = s.rounds + 1;
    } 
    if (s.rounds == 4 && !alone && s.shared < 3) {
      s.shared = s.shared + 1;
    }
    if (s.shared == 3) {
      s.shared = 0;
      s.quad = s.quad + 1;
    }
    if ((s.quad == 4 && s.shared == 1) || (s.count > 0 && s.count < 4)) {
      s.shared = 0;
      s.count = s.count + 1;
    }
    if (s.count >= 3 && alone) {
      s.even = true;
      s.quad = 1;
      s.rounds = 0;
      s.status_ = "Between";
    }
  }

  var Move_search = function(s) {
    if (s.status_ == "Between") {
      if (s.role == "Explorer") {
        return "West";
      } else {
        return s.role;
      }
    } else if (s.status_ == "Exploring" && s.role == "West") {
      if (s.down) {
        return "South";
      } else if (s.count == 2) {
        return "North";
      }
    } else if (s.status_ == "Exploring" && s.role == "Explorer") {
      if (s.shared == 0 && s.count < 3) {
        if (s.count > 0) {
          if (s.even) { return "West" }
          else { return "North" }
        } else if ((s.quad == 1 && s.even) || (s.quad == 4 && !s.even)) {
          return "North";
        } else if ((s.quad == 1 && !s.even) || (s.quad == 2 && s.even)) {
          return "East";
        } else if ((s.quad == 2 && !s.even) || (s.quad == 3 && s.even)) {
          return "South";
        } else if ((s.quad == 3 && !s.even) || (s.quad == 4 && s.even)) {
          return "West";
        }

      }
    }
  }

  var initialize_for_geometric = function(s) {
    s.quad = null;
    s.coin = "HEADS";
  }

  var delta_geometric = function(s, alone, origin) {
    if (s.quad == null) {
      coin1 = flip_coin();
      coin2 = flip_coin();
      if (coin1 == "HEADS" && coin2 == "HEADS") {
        s.quad = 1;
      } else if (coin1 == "HEADS" && coin2 == "TAILS") {
        s.quad = 2;
      } else if (coin1 == "TAILS" && coin2 == "HEADS") {
        s.quad = 3;
      } else if (coin1 == "TAILS" && coin2 == "TAILS") {
        s.quad = 4;
      }
    } else if (s.coin == "HEADS") {
      s.coin = flip_coin();
    }
  }

  var Move_geometric = function(s) {
    if ((s.quad == 1 && s.coin == "TAILS") || (s.quad == 2 && s.coin == "HEADS")) {
      return "North"
    } else if ((s.quad == 1 && s.coin == "HEADS") || (s.quad == 4 && s.coin == "TAILS")) {
      return "East"
    } else if ((s.quad == 3 && s.coin == "TAILS") || (s.quad == 4 && s.coin == "HEADS")) {
      return "South"
    } else if ((s.quad == 3 && s.coin == "HEADS") || (s.quad == 2 && s.coin == "TAILS")) {
      return "West"
    }
  }

  var initialize_for_hybrid = function(s) {
    s.algorithm = null;
    s.phase = null;
    s.pause = false;
  }

  var delta_hybrid = function(s, alone, origin) {
    if (s.algorithm == null) {
      coin = flip_coin();
      if (coin == "HEADS") {
        s.algorithm = "Rectangle";
        initialize_for_separation(s);
        s.phase = "Separation";
        s.pause = true;
      } else {
        s.algorithm = "Geometric";
        initialize_for_geometric(s);
      }
    } else if (s.algorithm == "Rectangle") {
      if (s.pause) {
        s.pause = false;
      } else {
        delta_rectangle(s, alone, origin);
      }
    }
    if (s.algorithm == "Geometric") {
      delta_geometric(s, alone, origin);
    }
  }

  var Move_hybrid = function(s) {
    if (s.algorithm == "Rectangle" && !s.pause) {
      return Move_rectangle(s);
    } else if (s.algorithm == "Geometric") {
      return Move_geometric(s);
    }
  }
  
  var is_alone = function(agent, others) {
    var share = others.some(function(e) {
      return (e.x == agent.x && e.y == agent.y && e.state !== agent.state)
    });
    return !share;
  }

  var execute_move = function(dirs) {
    console.log(AGENTS.length);
    var next = Object.create(null);
    $("img").removeClass("multiple");

    for (var i in AGENTS) {
      var img = $("#" + i);
      var uid = img.position().left + "," + img.position().top + dirs[i];
      if (!(uid in next)) {
        img.css("opacity", 1);
        next[uid] = i;
      } else if (next[uid] !== false) {
        var old_img = $("#" + next[uid]);
        if (!old_img.hasClass("multiple")) {
          old_img.addClass("multiple");
        }
        next[uid] = false;
      }

    }
    var iters = 0
    var interval = setInterval(function() {
      for (var i in AGENTS) {
        var x = AGENTS[i].x;
        var y = AGENTS[i].y;
        if (AGENTS[i].state.algorithm == "Rectangle" || (AGENTS[i].state.algorithm == "Geometric" && x >= X_MIN - 1 && x <= X_MAX + 1 && y >= Y_MIN - 1 && y <= Y_MAX + 1) ) {
        var img = $("#" + i);
        if (dirs[i] == "North") {
          img.css("top", img.position().top - 4 + "px");
        } else if (dirs[i] == "East") {
          img.css("left", img.position().left + 4 + "px");
        } else if (dirs[i] == "South") {
          img.css("top", img.position().top + 4 + "px");
        } else if (dirs[i] == "West") {
          img.css("left", img.position().left - 4 + "px");
        }
        }
      }
      iters += 1;
      if (iters == (SIZE + BORDER)/4) {
        clearInterval(interval);
        var occupied = Object.create(null);
        for (var i in AGENTS) {
          var img = $("#" + i);
          var uid = img.position().left + "," + img.position().top;
          if (uid in occupied) {
            img.css("opacity", 0);
            //img.removeClass("multiple");
            $("#" + occupied[uid]).addClass("multiple");
          } else {
            occupied[uid] = i;
          }
        }
      }
    }, FRAME_RATE);

  }

  
  var setup = function() {
    AGENTS = [];
    for (var i = 0; i < NUM_AGENTS; i++) {
      AGENTS.push({x: 0, y: 0, state: new State()});
    }

    for (var i in AGENTS) {
      if (ALGORITHM == "Hybrid-Search") {
        initialize_for_hybrid(AGENTS[i].state);
      } else if (ALGORITHM == "Rectangle-Search") {
        AGENTS[i].state.algorithm = "Rectangle";
        AGENTS[i].state.phase = "Separation";
        initialize_for_separation(AGENTS[i].state);
      } else if (ALGORITHM == "Geometric-Search") {
        AGENTS[i].state.algorithm = "Geometric";
        initialize_for_geometric(AGENTS[i].state);
      }
      var img = $("<img>");
      img.addClass("agent");
      img.attr("src", "http://icons.iconarchive.com/icons/icons8/windows-8/512/Animals-Ant-icon.png");
      img.attr("id", i);
      img.css("width", IMG_WIDTH);
      img.css("height", IMG_HEIGHT);
      img.css("top",
          ((BOARD_HEIGHT - 3) / 2) * (SIZE + BORDER) + BORDER + (SIZE - IMG_HEIGHT)/2 + (y_left/2))
      img.css("left", ((BOARD_WIDTH - 3) / 2) * (SIZE + BORDER) + BORDER + (SIZE - IMG_WIDTH)/2 + CONTROLS_WIDTH + 2*BORDER)
      $("body").append(img);
    }
  }

  /*
  var dirs = [];
  for (var i in agents) {
    dirs.push(Move_geometric(agents[i].state));
  }
  setTimeout(function() {
    execute_move(agents, dirs);
  }, 3000);
*/
  
  var execute_round = function() {

    $("#number").html(Number($("#number").html()) + 1)
    var dirs = []
    for (var i in AGENTS) {
      var move;
      if (ALGORITHM == "Hybrid-Search") {
        move = Move_hybrid(AGENTS[i].state);
      } else if (ALGORITHM == "Rectangle-Search") {
        move = Move_rectangle(AGENTS[i].state);
      } else if (ALGORITHM == "Geometric-Search") {
        move = Move_geometric(AGENTS[i].state);
      }
      dirs.push(move);
      if (move == "North") {
        AGENTS[i].y += 1;
      } else if (move == "East") {
        AGENTS[i].x += 1;
      } else if (move == "South") {
        AGENTS[i].y -= 1;
      } else if (move == "West") {
        AGENTS[i].x -= 1;
      }
    }
    execute_move(dirs);
    for (var i in AGENTS) {
      var alone = is_alone(AGENTS[i], AGENTS);
      var origin = (AGENTS[i].x == 0 && AGENTS[i].y == 0);
      if (ALGORITHM == "Hybrid-Search") {
        delta_hybrid(AGENTS[i].state, alone, origin);
      } else if (ALGORITHM == "Rectangle-Search") {
        delta_rectangle(AGENTS[i].state, alone, origin);
      } else if (ALGORITHM == "Geometric-Search") {
        delta_geometric(AGENTS[i].state, alone, origin);
      }
    }
    setTimeout(function() {
      for (var i in AGENTS) {
        var cell = $("#" + AGENTS[i].x + "_" + AGENTS[i].y);
        if (!cell.hasClass("explored")) {
          cell.addClass("explored");
        }
      }
      if (!$("#play_cover").is(":visible")) {
        $("#step_cover").hide();
      }
    }, (2/3) * (FRAME_RATE * (SIZE + BORDER)) / 4);
   $("#restart_cover").hide();
  }
  

  setup();
  $(".agent").css("opacity", 0);
  $("#0").css("opacity", 1);
  $("#0").addClass("multiple");
  ROUND = setInterval(function() {
      execute_round();
  }, ROUND_SPEED);

  var play_press = false;
  
  $("#play").click(function() { 
    execute_round();
    ROUND = setInterval(function() {
        execute_round();
    }, ROUND_SPEED);
    $("#play_cover").show();
    $("#step_cover").show();
   $("#pause_cover").hide();
   if (!play_press) {
      $("#message").css("color", "rgb(50, 50, 50)");
   }
   play_press = true;
  });

$("#play_cover").show();
$("#pause_cover").hide();
$("#step_cover").show();
$("#restart_cover").hide();

  
$("#pause").click(function() {
  clearInterval(ROUND)
  $("#play_cover").hide();
  $("#step_cover").hide();
  $("#pause_cover").show();
});

$("#step").click(function() {
  execute_round();
  $("#step_cover").show();
});

$("#restart").click(function() {
  $(".agent").remove();
  clearInterval(ROUND);
  $("#message").css("color", "rgb(50, 50, 50)");
  $("#number").html(0)
  $("td").removeClass("explored");
  setup();
  $(".agent").css("opacity", 0);
  $("#0").css("opacity", 1);
  if (NUM_AGENTS > 1) {
    $("#0").addClass("multiple");
  }
  ROUND = setInterval(function() {
    execute_round();
  }, ROUND_SPEED);
  $("#restart_cover").show();
  $("#play_cover").show();
  $("#step_cover").show();
  $("#pause_cover").hide();
});

$( "#agents_slider" ).slider({
  value:50,
  min: 1,
  max: 99,
  step: 1,
  slide: function(event, ui) {
    NUM_AGENTS = ui.value;
    $("#number_agents").html(ui.value);

  },
  change: function(event, ui) {
    $("#message").css("color", "white");
  }
});

$("select").on("change", function() {
  $("#message").css("color", "white");
  ALGORITHM = $("select").val();
});

$( "#speed_slider" ).slider({
  value: -1000,
  min: -2000,
  max: -500,
  slide: function(event, ui) {
    clearInterval(ROUND)
    ROUND_SPEED = -ui.value;
    ROUND = setInterval(function() {
      execute_round();
    }, ROUND_SPEED);
  }
});

});
