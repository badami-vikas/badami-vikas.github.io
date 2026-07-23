(function () {
  "use strict";

  var cases = {
    steam: [
      {
        era: "Steam Engine",
        title: "Manufacturing",
        image: "steam-manufacturing.jpg",
        transitional: "The steam engine is a better source of power.",
        transitionalDetail: "By preserving existing workflows, manufacturers built better mills.",
        transformational: "The steam engine is a new way to organize production.",
        transformationalDetail: "By redesigning work around centralized production, manufacturers created the factory system."
      },
      {
        era: "Steam Engine",
        title: "Agriculture",
        image: "steam-agriculture.jpg",
        transitional: "Steam power makes existing farm work faster.",
        transitionalDetail: "By mechanizing individual tasks, producers created more efficient farms.",
        transformational: "Steam power enables farming to operate as a mechanized system.",
        transformationalDetail: "By reorganizing land, labor, processing, and transport, producers created modern mechanized agriculture."
      },
      {
        era: "Steam Engine",
        title: "Transport",
        image: "steam-transport.jpg",
        transitional: "The steam locomotive is a faster vehicle.",
        transitionalDetail: "By improving individual journeys, operators created better travel.",
        transformational: "The steam locomotive is the engine of a connected transport network.",
        transformationalDetail: "By standardizing tracks, schedules, stations, and freight connections, operators created the railway system."
      }
    ],
    electricity: [
      {
        era: "Electricity",
        title: "Manufacturing",
        image: "electricity-manufacturing.jpg",
        transitional: "The electric motor is a cleaner replacement for the steam engine.",
        transitionalDetail: "By replacing the power source, manufacturers created more efficient factories.",
        transformational: "The electric motor allows production to follow the flow of work.",
        transformationalDetail: "By arranging workstations in sequence, manufacturers created modern mass production."
      },
      {
        era: "Electricity",
        title: "The Home",
        image: "electricity-home.jpg",
        transitional: "Electricity makes individual household chores easier.",
        transitionalDetail: "By improving separate chores, households created better-equipped homes.",
        transformational: "Electricity allows the home to function as an integrated labor-saving system.",
        transformationalDetail: "By redesigning domestic life around electric services, households created the modern electric home."
      },
      {
        era: "Electricity",
        title: "Communication",
        image: "electricity-communication.jpg",
        transitional: "Electric communication sends written messages faster.",
        transitionalDetail: "By accelerating message delivery, operators created better telegraphy.",
        transformational: "Electric communication enables people to converse across distance.",
        transformationalDetail: "By organizing communication as shared infrastructure, providers created the telephone network."
      },
      {
        era: "Electricity",
        title: "Power Distribution",
        image: "electricity-grid.jpg",
        transitional: "Electricity is a better way to light nearby buildings.",
        transitionalDetail: "By improving local lighting, providers created better illuminated districts.",
        transformational: "Electricity is a utility that can serve entire regions.",
        transformationalDetail: "By organizing generation and distribution as a network, providers created the electric grid."
      },
      {
        era: "Electricity",
        title: "Vertical Transportation",
        image: "electricity-vertical.jpg",
        transitional: "Electricity makes stairways safer and easier to use.",
        transitionalDetail: "By improving the climb, building owners created better stairways.",
        transformational: "Electricity makes routine vertical travel possible.",
        transformationalDetail: "By redesigning buildings around vertical movement, architects created the modern skyscraper."
      },
      {
        era: "Electricity",
        title: "Motion Pictures",
        image: "electricity-cinema.jpg",
        transitional: "Motion pictures can enhance live entertainment.",
        transitionalDetail: "By supplementing stage shows, theater owners created better vaudeville programs.",
        transformational: "Motion pictures are a repeatable, distributable form of entertainment.",
        transformationalDetail: "By organizing entertainment around recorded stories, producers created the motion-picture industry."
      }
    ],
    computer: [
      {
        era: "Computer",
        title: "Retail Operations",
        image: "computer-retail.jpg",
        transitional: "Computers make administrative retail work faster.",
        transitionalDetail: "By digitizing back-office tasks, retailers created more efficient retail administration.",
        transformational: "Computers can coordinate the entire retail operation.",
        transformationalDetail: "By linking stores, warehouses, suppliers, and inventory, retailers created the data-driven retail system."
      },
      {
        era: "Computer",
        title: "Enterprise Operations",
        image: "computer-enterprise.jpg",
        transitional: "Computers make record-keeping faster.",
        transitionalDetail: "By digitizing departmental paperwork, companies created more efficient administration.",
        transformational: "Computers can become the operating backbone of the enterprise.",
        transformationalDetail: "By integrating core functions through shared data, companies created the digital enterprise."
      },
      {
        era: "Computer",
        title: "Payments",
        image: "computer-payments.jpg",
        transitional: "Computers process each bank's transactions faster.",
        transitionalDetail: "By improving individual banks, institutions created better banking operations.",
        transformational: "Computers can connect many institutions into one payment network.",
        transformationalDetail: "By organizing payments as shared infrastructure, providers created the global electronic payment network."
      }
    ],
    internet: [
      {
        era: "Internet",
        title: "Entertainment",
        image: "internet-entertainment.jpg",
        transitional: "The Internet is another channel for renting DVDs.",
        transitionalDetail: "By extending the rental model online, companies created better video rental.",
        transformational: "The Internet is the delivery system for entertainment.",
        transformationalDetail: "By redesigning distribution around instant access, providers created the streaming platform."
      },
      {
        era: "Internet",
        title: "Retail",
        image: "internet-retail.jpg",
        transitional: "The Internet is another channel for selling products.",
        transitionalDetail: "By extending stores onto the web, retailers created online storefronts.",
        transformational: "The Internet is the foundation of a new retail model.",
        transformationalDetail: "By redesigning retail around digital discovery and fulfillment, retailers created e-commerce."
      },
      {
        era: "Internet",
        title: "Knowledge",
        image: "internet-knowledge.jpg",
        transitional: "The Internet is a faster way to publish an encyclopedia.",
        transitionalDetail: "By digitizing the reference book, publishers created a better encyclopedia.",
        transformational: "The Internet is a place where knowledge can grow collaboratively.",
        transformationalDetail: "By organizing knowledge as an open contribution network, platforms created the collaborative encyclopedia."
      },
      {
        era: "Internet",
        title: "Urban Mobility",
        image: "internet-mobility.jpg",
        transitional: "The Internet makes booking a taxi easier.",
        transitionalDetail: "By digitizing reservations, operators created better taxi service.",
        transformational: "The Internet can coordinate urban transportation in real time.",
        transformationalDetail: "By organizing mobility as a live marketplace, platforms created the ride-hailing model."
      },
      {
        era: "Internet",
        title: "Music",
        image: "internet-music.jpg",
        transitional: "The Internet is another channel for selling music.",
        transitionalDetail: "By digitizing individual sales, companies created the online music store.",
        transformational: "The Internet makes a music catalog continuously accessible.",
        transformationalDetail: "By reorganizing distribution around access, services created the music-streaming platform."
      }
    ]
  };

  var levels = {
    1: {
      title: "AI improves individuals.",
      points: [
        "AI assists. People deliver.",
        "Time and cost efficiency compounds.",
        "Improves how work gets done, not what gets done.",
        "Success is measured by individual productivity."
      ]
    },
    2: {
      title: "Teams become AI-native.",
      points: [
        "AI executes. People orchestrate.",
        "Capabilities compound. Consistency becomes the advantage.",
        "Scales output without scaling headcount.",
        "Success is measured by throughput and consistency."
      ]
    },
    3: {
      title: "Expertise becomes organizational memory.",
      points: [
        "AI learns. People design.",
        "Knowledge compounds. Capability becomes the advantage.",
        "Every project makes the organization smarter.",
        "Success is measured by knowledge reuse and institutional learning."
      ]
    },
    4: {
      title: "The organization redesigns itself around intelligence.",
      points: [
        "AI synchronizes. People reinvent.",
        "Intelligence compounds. Leverage becomes the advantage.",
        "The organization is designed around capabilities instead of functions.",
        "Remove bottlenecks. Accelerate decisions.",
        "Success is measured by cross-functional collaboration and governance."
      ]
    },
    5: {
      title: "The organization becomes AI-native.",
      points: [
        "AI amplifies. People redefine.",
        "Advantage compounds.",
        "Create new value, new business models, and lasting differentiation.",
        "Success is measured by innovation, growth, and strategic advantage."
      ]
    }
  };

  var activeCategory = "steam";
  var activeIndexes = { steam: 0, electricity: 0, computer: 0, internet: 0 };
  var caseStudy = document.querySelector(".case-study");
  var caseImage = document.getElementById("case-image");

  function setText(id, text) {
    var node = document.getElementById(id);
    if (node) node.textContent = text;
  }

  function renderCase(category, index) {
    var entry = cases[category][index];
    if (!entry) return;
    caseStudy.classList.add("changing");
    window.setTimeout(function () {
      caseImage.src = "assets/comparison-case-studies/" + entry.image;
      caseImage.alt = entry.title + ": transitional and transformational approaches";
      setText("case-era", entry.era);
      setText("case-title", entry.title);
      setText("case-transitional", entry.transitional);
      setText("case-transitional-detail", entry.transitionalDetail);
      setText("case-transformational", entry.transformational);
      setText("case-transformational-detail", entry.transformationalDetail);
      caseStudy.classList.remove("changing");
    }, 170);
  }

  document.querySelectorAll(".case-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      activeCategory = tab.dataset.category;
      document.querySelectorAll(".case-tab").forEach(function (item) {
        var selected = item === tab;
        item.classList.toggle("on", selected);
        item.setAttribute("aria-selected", selected ? "true" : "false");
      });
      renderCase(activeCategory, activeIndexes[activeCategory]);
    });
  });

  document.getElementById("generate-case").addEventListener("click", function () {
    activeIndexes[activeCategory] = (activeIndexes[activeCategory] + 1) % cases[activeCategory].length;
    renderCase(activeCategory, activeIndexes[activeCategory]);
  });

  var overview = document.getElementById("level-overview");
  var expanded = document.getElementById("level-expanded");
  var points = document.getElementById("level-points");
  var lockedLevel = null;

  function showLevel(level) {
    var entry = levels[level];
    if (!entry) return;
    overview.hidden = true;
    expanded.hidden = false;
    setText("level-kicker", "Level " + level);
    setText("level-title", entry.title);
    points.innerHTML = entry.points.map(function (point) {
      return "<li>" + point + "</li>";
    }).join("");
    document.querySelectorAll(".maturity-level").forEach(function (button) {
      var selected = button.dataset.level === String(level);
      button.classList.toggle("on", selected);
      button.setAttribute("aria-expanded", selected ? "true" : "false");
    });
  }

  function showOverview() {
    if (lockedLevel) {
      showLevel(lockedLevel);
      return;
    }
    overview.hidden = false;
    expanded.hidden = true;
    document.querySelectorAll(".maturity-level").forEach(function (button) {
      button.classList.remove("on");
      button.setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll(".maturity-level").forEach(function (button) {
    button.addEventListener("mouseenter", function () { showLevel(button.dataset.level); });
    button.addEventListener("focus", function () { showLevel(button.dataset.level); });
    button.addEventListener("mouseleave", showOverview);
    button.addEventListener("blur", showOverview);
    button.addEventListener("click", function () {
      lockedLevel = lockedLevel === button.dataset.level ? null : button.dataset.level;
      if (lockedLevel) showLevel(lockedLevel);
      else showOverview();
    });
  });
})();
