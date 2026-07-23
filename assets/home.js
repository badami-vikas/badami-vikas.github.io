(function () {
  "use strict";

  var cases = {
    steam: [
      {
        title: "Manufacturing",
        image: "steam-manufacturing.jpg",
        left: [
          "**The steam engine** is a better source of power.",
          "By replacing water wheels with steam engines, manufacturers powered existing mills more reliably.",
          "By preserving existing workflows, they built **better mills**."
        ],
        right: [
          "**The steam engine** is a new way to organize production.",
          "By centralizing workers and machines around steam power, manufacturers coordinated specialized production at unprecedented scale.",
          "By redesigning work around centralized production, they created the **factory system**."
        ]
      },
      {
        title: "Agriculture",
        image: "steam-agriculture.jpg",
        left: [
          "**Steam power** makes existing farm work faster.",
          "By powering threshers and pumps with steam, farmers reduced labor within existing field patterns.",
          "By mechanizing individual tasks, they created **more efficient farms**."
        ],
        right: [
          "**Steam power** enables farming to operate as a mechanized system.",
          "By reorganizing land, labor, processing, and transport around machines, producers coordinated farming at greater scale.",
          "By redesigning the entire production model, they created **modern mechanized agriculture**."
        ]
      },
      {
        title: "Transport",
        image: "steam-transport.jpg",
        left: [
          "**The steam locomotive** is a faster vehicle.",
          "By improving locomotives, operators moved passengers and freight faster along individual road routes.",
          "By improving individual journeys, they created **better travel**."
        ],
        right: [
          "**The steam locomotive** is the engine of a connected transport network.",
          "By standardizing tracks, schedules, stations, and freight connections, operators linked cities, ports, and markets.",
          "By organizing transport as a network, they created the **railway system**."
        ]
      }
    ],
    electricity: [
      {
        title: "Manufacturing",
        image: "electricity-manufacturing.jpg",
        left: [
          "**The electric motor** is a cleaner replacement for the steam engine.",
          "By attaching one motor to existing shafts and belts, manufacturers preserved traditional factory layouts.",
          "By replacing the power source, they created **more efficient factories**."
        ],
        right: [
          "**The electric motor** allows production to follow the flow of work.",
          "By powering machines individually, manufacturers arranged workstations in sequence and moved products continuously between them.",
          "By redesigning factories around production flow, they created **modern mass production**."
        ]
      },
      {
        title: "The home",
        image: "electricity-home.jpg",
        left: [
          "**Electricity** makes individual household chores easier.",
          "By electrifying irons and other single tools, households reduced effort one task at a time.",
          "By improving separate chores, they created **better-equipped homes**."
        ],
        right: [
          "**Electricity** allows the home to function as an integrated labor-saving system.",
          "By adopting refrigeration, washing, lighting, and appliances together, households reorganized food storage, cleaning, and daily routines.",
          "By redesigning domestic life around electric services, they created the **modern electric home**."
        ]
      },
      {
        title: "Communication",
        image: "electricity-communication.jpg",
        left: [
          "**Electric communication** sends written messages faster.",
          "By improving telegraph equipment, operators transmitted coded messages faster between staffed offices.",
          "By accelerating message delivery, they created **better telegraphy**."
        ],
        right: [
          "**Electric communication** enables people to converse across distance.",
          "By connecting telephones through exchanges and shared lines, providers enabled direct, real-time conversation.",
          "By organizing communication as shared infrastructure, they created the **telephone network**."
        ]
      },
      {
        title: "Power distribution",
        image: "electricity-grid.jpg",
        left: [
          "**Electricity** is a better way to light nearby buildings.",
          "By replacing gas lamps with bulbs supplied by local generators, providers improved lighting within limited areas.",
          "By improving local lighting, they created **better illuminated districts**."
        ],
        right: [
          "**Electricity** is a utility that can serve entire regions.",
          "By using alternating current, transformers, and transmission lines, providers moved power efficiently across long distances.",
          "By organizing generation and distribution as a network, they created the **electric grid**."
        ]
      },
      {
        title: "Vertical transportation",
        image: "electricity-vertical.jpg",
        left: [
          "**Electricity** makes stairways safer and easier to use.",
          "By replacing gas lamps with electric lighting, building owners improved the existing journey between floors.",
          "By improving the climb, they created **better stairways**."
        ],
        right: [
          "**Electricity** makes routine vertical travel possible.",
          "By installing electric elevators, architects moved people rapidly through buildings without relying on stairs.",
          "By redesigning buildings around vertical movement, they created the **modern skyscraper**."
        ]
      },
      {
        title: "Motion pictures",
        image: "electricity-cinema.jpg",
        left: [
          "**Motion pictures** can enhance live entertainment.",
          "By showing short films between live acts, theater owners added novelty without changing the performance model.",
          "By supplementing stage shows, they created **better vaudeville programs**."
        ],
        right: [
          "**Motion pictures** are a repeatable, distributable form of entertainment.",
          "By coordinating studios, cinemas, and film distribution, producers delivered the same recorded performance to mass audiences.",
          "By organizing entertainment around recorded stories, they created the **motion-picture industry**."
        ]
      }
    ],
    computer: [
      {
        title: "Retail operations",
        image: "computer-retail.jpg",
        left: [
          "**Computers** make administrative retail work faster.",
          "By automating payroll and accounting, retailers reduced paperwork while stores continued operating independently.",
          "By digitizing back-office tasks, they created **more efficient retail administration**."
        ],
        right: [
          "**Computers** can coordinate the entire retail operation.",
          "By linking stores, warehouses, suppliers, and inventory data, retailers synchronized replenishment across the business.",
          "By organizing retail around shared information, they created the **data-driven retail system**."
        ]
      },
      {
        title: "Enterprise operations",
        image: "computer-enterprise.jpg",
        left: [
          "**Computers** make record-keeping faster.",
          "By replacing paper ledgers with digital records, companies accelerated work inside separate departments.",
          "By digitizing departmental paperwork, they created **more efficient administration**."
        ],
        right: [
          "**Computers** can become the operating backbone of the enterprise.",
          "By connecting finance, procurement, manufacturing, inventory, human resources, and sales, companies coordinated work through shared data.",
          "By integrating core functions, they created the **digital enterprise**."
        ]
      },
      {
        title: "Payments",
        image: "computer-payments.jpg",
        left: [
          "**Computers** process each bank's transactions faster.",
          "By automating internal records and settlements, banks improved processing while preserving branch-centered operations.",
          "By improving individual banks, they created **better banking operations**."
        ],
        right: [
          "**Computers** can connect many institutions into one payment network.",
          "By linking banks, merchants, cardholders, authorization, and settlement, payment providers coordinated transactions across institutions.",
          "By organizing payments as shared infrastructure, they created the **global electronic payment network**."
        ]
      }
    ],
    internet: [
      {
        title: "Entertainment",
        image: "internet-entertainment.jpg",
        left: [
          "**The Internet** is another channel for renting DVDs.",
          "By accepting DVD orders online, rental companies added convenience while physical inventory remained central.",
          "By extending the rental model online, they created **better video rental**."
        ],
        right: [
          "**The Internet** is the delivery system for entertainment.",
          "By streaming digital video on demand, providers delivered entertainment instantly across connected devices.",
          "By redesigning distribution around instant access, they created the **streaming platform**."
        ]
      },
      {
        title: "Retail",
        image: "internet-retail.jpg",
        left: [
          "**The Internet** is another channel for selling products.",
          "By adding an online storefront, retailers sold existing inventory while physical stores remained central.",
          "By extending stores onto the web, they created **online storefronts**."
        ],
        right: [
          "**The Internet** is the foundation of a new retail model.",
          "By integrating vast selection, search, recommendations, payments, fulfillment, and delivery, retailers built commerce for online customers.",
          "By redesigning retail around digital discovery and fulfillment, they created **e-commerce**."
        ]
      },
      {
        title: "Knowledge",
        image: "internet-knowledge.jpg",
        left: [
          "**The Internet** is a faster way to publish an encyclopedia.",
          "By placing expert-written articles online, publishers expanded access while retaining centralized editorial control.",
          "By digitizing the reference book, they created **a better encyclopedia**."
        ],
        right: [
          "**The Internet** is a place where knowledge can grow collaboratively.",
          "By letting volunteers write, link, review, and continuously revise articles, platforms pooled knowledge across the world.",
          "By organizing knowledge as an open contribution network, they created the **collaborative encyclopedia**."
        ]
      },
      {
        title: "Urban mobility",
        image: "internet-mobility.jpg",
        left: [
          "**The Internet** makes booking a taxi easier.",
          "By adding online reservations, taxi companies simplified booking while preserving fleets and dispatch centers.",
          "By digitizing reservations, they created **better taxi service**."
        ],
        right: [
          "**The Internet** can coordinate urban transportation in real time.",
          "By connecting riders, independent drivers, routing, pricing, and payments, platforms matched supply with demand continuously.",
          "By organizing mobility as a live marketplace, they created the **ride-hailing platform**."
        ]
      },
      {
        title: "Music",
        image: "internet-music.jpg",
        left: [
          "**The Internet** is another channel for selling music.",
          "By selling downloadable tracks, music companies changed delivery while customers still purchased individual recordings.",
          "By digitizing individual sales, they created **the online music store**."
        ],
        right: [
          "**The Internet** makes a music catalog continuously accessible.",
          "By combining licensed catalogs, subscriptions, recommendations, and on-demand playback, services replaced ownership with access.",
          "By reorganizing distribution around access, they created the **music-streaming platform**."
        ]
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
        "Capabilities compounds. Consistency becomes the advantage.",
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
        "Success is measured by Cross-functional collaboration and governance."
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

  function inlineMarkdown(text) {
    return text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  function renderPoints(id, values) {
    var list = document.getElementById(id);
    list.innerHTML = values.map(function (value) {
      return "<li>" + inlineMarkdown(value) + "</li>";
    }).join("");
  }

  function renderCase(category, index) {
    var entry = cases[category][index];
    if (!entry) return;
    caseStudy.classList.add("changing");
    window.setTimeout(function () {
      caseImage.src = "assets/comparison-case-studies/" + entry.image;
      caseImage.alt = entry.title + ": transitional and transformational approaches";
      renderPoints("case-transitional", entry.left);
      renderPoints("case-transformational", entry.right);
      caseStudy.classList.remove("changing");
    }, 150);
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
