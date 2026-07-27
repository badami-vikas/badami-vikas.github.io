(function (root) {
"use strict";

const stages = [
  {
    verb: "Ask",
    label: "Task help",
    title: "Doing the Same Work Differently",
    generalHeadline: "AI improves the work in front of one person",
    zazooHeadline: "Zazoo brings useful help into the moment of work"
  },
  {
    verb: "Direct",
    label: "Managed AI",
    title: "Doing Different Work the Same Way",
    generalHeadline: "One person moves from asking AI to managing AI",
    zazooHeadline: "Zazoo turns repeatable work into dependable delegation"
  },
  {
    verb: "Multiply",
    label: "Reusable capability",
    title: "Working Differently",
    generalHeadline: "What works becomes capability others can use",
    zazooHeadline: "Zazoo turns successful work into reusable capability"
  },
  {
    verb: "Extend",
    label: "Shared capability",
    title: "Organizing Differently",
    generalHeadline: "Capability moves across the organization without losing control",
    zazooHeadline: "Zazoo carries trusted capability to the point of need"
  },
  {
    verb: "Reinvent",
    label: "Competitive model",
    title: "Competing Differently",
    generalHeadline: "Compounding intelligence changes how the business competes",
    zazooHeadline: "Zazoo turns accumulated learning into operating advantage"
  }
];

const functions = {
  general: {
    name: "General",
    systems: "the business systems where work is recorded",
    work: [
      "research, drafting, analysis, and everyday decisions",
      "a bounded sequence of repeatable individual work",
      "successful ways of working",
      "trusted expertise and approved ways of working",
      "work, decisions, offerings, and organizational learning"
    ],
    scale: [
      "access to immediate assistance",
      "the volume and consistency of work one person can manage",
      "knowledge reuse and organizational memory",
      "governed capability across roles and functions",
      "learning, adaptation, and differentiated value"
    ],
    measures: [
      "time saved, output quality, adoption, and the amount of rework required",
      "throughput, consistency, completion quality, and human intervention rates",
      "reuse, time to proficiency, expert dependency, and improvement across repeated work",
      "cross-functional reuse, bottleneck reduction, policy compliance, and decision consistency",
      "innovation, growth, adaptability, new value creation, and strategic advantage"
    ],
    zazoo: [
      "Zazoo understands the work in front of a person and brings forward the most relevant context for research, drafting, analysis, and decisions.",
      "Zazoo coordinates bounded work, maintains its context, and returns consequential decisions or exceptions for human judgment.",
      "Zazoo connects context, decisions, feedback, and outcomes so successful work becomes capability others can reuse.",
      "Zazoo makes approved capability available across roles while preserving ownership, permissions, policy, and escalation paths.",
      "Zazoo connects work, memory, capability, and governance so the organization can learn as one and create new value."
    ]
  },
  hr: {
    name: "Human Resources",
    systems: "the applicant tracking, human resources, learning, and employee service systems",
    work: [
      "role design, policy guidance, employee support, and development conversations",
      "recruiting, onboarding, employee service, and manager follow-through",
      "successful hiring, onboarding, development, and employee support practices",
      "approved people practices used directly by managers and teams",
      "how talent is attracted, developed, deployed, and retained"
    ],
    scale: [
      "relevant people guidance at the moment of need",
      "consistent recruiting, onboarding, and employee service without constant coordination",
      "people expertise beyond a few experienced practitioners",
      "governed people capability across managers, locations, and functions",
      "workforce learning and better talent decisions across the business"
    ],
    measures: [
      "response time, manager confidence, policy accuracy, quality, and rework",
      "time to hire, onboarding completion, service consistency, exception rates, and human intervention",
      "practice reuse, time to proficiency, expert dependency, and improvement across employee journeys",
      "manager self-service, bottleneck reduction, policy compliance, fairness, and decision consistency",
      "workforce adaptability, retention, internal mobility, productivity, and strategic talent advantage"
    ],
    zazoo: [
      "Zazoo brings the right policy, role context, and employee history into the manager's moment of need.",
      "Zazoo coordinates appropriate recruiting, onboarding, and employee service work while returning sensitive judgments and exceptions to people.",
      "Zazoo preserves what makes a people practice successful so the next manager or practitioner can reuse it with confidence.",
      "Zazoo gives teams direct access to approved people practices while Human Resources retains control of policy, fairness, permissions, and exceptions.",
      "Zazoo connects workforce learning across the business so every employee journey strengthens future talent decisions."
    ]
  },
  finance: {
    name: "Finance",
    systems: "the accounting, planning, procurement, reporting, and enterprise resource systems",
    work: [
      "variance analysis, reporting, forecasting, and financial questions",
      "close, reconciliation, reporting, planning, and follow-through",
      "proven analyses, controls, assumptions, and financial decisions",
      "approved planning and analysis used directly by business leaders",
      "resource allocation, investment decisions, and continuous planning"
    ],
    scale: [
      "relevant financial insight at the moment of decision",
      "reliable financial execution without constant manual coordination",
      "financial judgment beyond a few experienced practitioners",
      "governed financial capability across leaders and functions",
      "continuous financial learning and more adaptive resource allocation"
    ],
    measures: [
      "analysis time, forecast quality, confidence, accuracy, and rework",
      "close time, throughput, reconciliation quality, exception rates, and human intervention",
      "analysis reuse, time to proficiency, control adherence, and decision improvement",
      "self-service use, bottleneck reduction, policy compliance, material exceptions, and decision consistency",
      "forecast responsiveness, capital efficiency, growth, adaptability, and strategic return"
    ],
    zazoo: [
      "Zazoo brings the relevant numbers, assumptions, definitions, and prior decisions into each financial question.",
      "Zazoo coordinates appropriate reporting, reconciliation, and planning work while escalating material exceptions for human review.",
      "Zazoo preserves the logic behind proven analyses so strong financial judgment becomes reusable capability.",
      "Zazoo gives leaders governed access to financial capability while Finance controls definitions, thresholds, permissions, and approvals.",
      "Zazoo connects operational signals with financial learning so investment and allocation decisions improve as the business moves."
    ]
  },
  sales: {
    name: "Sales",
    systems: "the customer relationship, sales engagement, conversation intelligence, and revenue systems",
    work: [
      "account research, meeting preparation, follow-up, and opportunity analysis",
      "prospecting, qualification, follow-through, and pipeline coordination",
      "successful sales motions, customer signals, and commercial judgment",
      "approved commercial capability used across revenue and customer teams",
      "new routes to revenue and continuously improving customer engagement"
    ],
    scale: [
      "relevant account intelligence at the moment of customer engagement",
      "consistent commercial execution without constant administrative coordination",
      "successful selling patterns beyond one representative or territory",
      "coherent commercial intelligence across revenue and customer functions",
      "market learning, differentiated customer value, and new revenue"
    ],
    measures: [
      "preparation time, seller confidence, relevance, follow-through, and rework",
      "throughput, response time, conversion consistency, exception rates, and seller intervention",
      "motion reuse, ramp time, representative dependency, conversion quality, and learning",
      "cross-functional reuse, bottleneck reduction, customer consistency, policy compliance, and ownership clarity",
      "revenue growth, sales cycle improvement, customer value, adaptability, and strategic differentiation"
    ],
    zazoo: [
      "Zazoo brings account history, relevant signals, and the next useful action into the seller's flow of work.",
      "Zazoo coordinates appropriate research, qualification, and follow-through while sellers retain control of promises, negotiation, and relationships.",
      "Zazoo captures why a sales motion worked so the capability improves beyond one representative or territory.",
      "Zazoo makes approved commercial intelligence useful across teams without fragmenting customer ownership.",
      "Zazoo connects market learning across the revenue system so the business can discover and scale new customer value."
    ]
  },
  marketing: {
    name: "Marketing",
    systems: "the content, campaign, customer data, analytics, and brand management systems",
    work: [
      "audience exploration, content development, campaign analysis, and creative preparation",
      "content, campaign, experimentation, and performance workflows",
      "successful growth patterns, audience context, and creative reasoning",
      "approved marketing capability used across sales, product, and regional teams",
      "new demand, customer experiences, and continuously improving market learning"
    ],
    scale: [
      "brand-aware assistance across everyday marketing work",
      "consistent campaign execution and experimentation without constant coordination",
      "successful marketing judgment beyond one campaign or practitioner",
      "coherent market capability across teams, regions, and channels",
      "market learning, differentiated experiences, and new demand"
    ],
    measures: [
      "creation time, brand alignment, relevance, quality, and rework",
      "campaign throughput, consistency, experiment velocity, exception rates, and human intervention",
      "pattern reuse, learning speed, practitioner dependency, performance improvement, and brand consistency",
      "cross-functional reuse, time to market, brand compliance, customer consistency, and ownership clarity",
      "growth, customer value, innovation, adaptability, and strategic differentiation"
    ],
    zazoo: [
      "Zazoo brings audience context, brand guidance, market signals, and prior learning into each marketing task.",
      "Zazoo coordinates appropriate content, campaign, and experimentation work while people retain creative direction and approval.",
      "Zazoo connects ideas with outcomes so successful marketing judgment becomes reusable capability.",
      "Zazoo makes approved market intelligence available across teams while Marketing protects brand coherence and trust.",
      "Zazoo links signals across the customer journey so the business can invent and scale new forms of value."
    ]
  },
  operations: {
    name: "Operations",
    systems: "the planning, service, quality, inventory, incident, and delivery systems",
    work: [
      "issue diagnosis, handovers, planning, and operating decisions",
      "scheduling, quality, service, incident, and delivery workflows",
      "proven operating responses, controls, and improvement patterns",
      "approved operating capability used directly across teams and locations",
      "adaptive delivery, capacity, quality, service, and resilience"
    ],
    scale: [
      "relevant operating guidance at the moment of work",
      "reliable execution without constant manual coordination",
      "operating expertise beyond a few experienced practitioners",
      "governed operating capability across teams, locations, and functions",
      "continuous operating learning, resilience, and adaptive delivery"
    ],
    measures: [
      "response time, decision quality, consistency, downtime, and rework",
      "throughput, service quality, cycle time, exception rates, and human intervention",
      "pattern reuse, recovery time, expert dependency, quality improvement, and learning",
      "cross-functional reuse, bottleneck reduction, standards adherence, resilience, and decision consistency",
      "service innovation, adaptability, quality, cost performance, resilience, and strategic advantage"
    ],
    zazoo: [
      "Zazoo brings live context, prior incidents, relevant procedures, and current constraints into the operator's moment of work.",
      "Zazoo coordinates appropriate scheduling, quality, service, and incident work while escalating risk, ambiguity, and exceptions to people.",
      "Zazoo preserves why an operating response worked so improvement becomes part of the system.",
      "Zazoo distributes approved operating capability while Operations controls standards, thresholds, permissions, and recovery paths.",
      "Zazoo connects learning across delivery so the operating model becomes more adaptive and resilient over time."
    ]
  },
  engineering: {
    name: "Engineering",
    systems: "the code, delivery, testing, incident, documentation, and product systems",
    work: [
      "system understanding, technical exploration, review, and engineering decisions",
      "testing, maintenance, delivery, incident, and follow-through workflows",
      "successful engineering patterns, tradeoffs, and technical decisions",
      "approved technical capability used across product and delivery teams",
      "new products, delivery models, and continuously improving engineering systems"
    ],
    scale: [
      "relevant technical context at the moment of engineering work",
      "reliable technical execution without constant manual coordination",
      "engineering expertise beyond one engineer or codebase",
      "governed technical capability across product and delivery functions",
      "product learning, delivery speed, and differentiated technical value"
    ],
    measures: [
      "time to understanding, review quality, developer confidence, defects, and rework",
      "throughput, reliability, cycle time, exception rates, and human intervention",
      "pattern reuse, ramp time, expert dependency, defect reduction, and learning",
      "cross-functional reuse, bottleneck reduction, standards adherence, system integrity, and ownership clarity",
      "innovation, delivery speed, reliability, adaptability, growth, and strategic differentiation"
    ],
    zazoo: [
      "Zazoo brings system context, prior decisions, current constraints, and relevant standards into the engineer's flow of work.",
      "Zazoo coordinates appropriate testing, maintenance, and delivery work while returning architecture, security, and consequential tradeoffs to people.",
      "Zazoo preserves why a technical pattern worked so expertise compounds beyond one engineer or codebase.",
      "Zazoo makes approved technical capability available across teams while Engineering protects quality, standards, and system integrity.",
      "Zazoo connects product and engineering learning so the business can create and deliver differentiated value faster."
    ]
  }
};

const stackDescriptions = [
  (selected) => `A general-purpose LLM, enterprise search tool, and document repository are combined to support ${selected.work[0]}. Relevant context is assembled manually and every output is checked before use.`,
  (selected) => `An LLM is connected to a workflow automation tool, task system, and ${selected.systems}. Triggers, handoffs, approvals, exceptions, and review steps are configured separately to manage ${selected.work[1]}.`,
  (selected) => `An LLM and automation layer are combined with a shared knowledge base, prompt library, version control, permissions, and analytics so ${selected.work[2]} can become reusable.`,
  (selected) => `Department solutions are connected through APIs and integration tooling, then surrounded with identity controls, policy rules, audit logs, monitoring, and support so ${selected.work[3]} can travel beyond its original function.`,
  (selected) => `Models, agents, workflow orchestration, shared memory, enterprise data, governance, observability, and experimentation tools are integrated into one operating stack to make ${selected.work[4]} more adaptive with every cycle.`
];

const generalHeadlines = stages.map((stage) => stage.generalHeadline);
const functionHeadlines = [
  (selected) => `${selected.name} uses AI as help for individual work`,
  (selected) => `${selected.name} moves from asking AI to managing AI`,
  (selected) => `What works in ${selected.name} becomes reusable capability`,
  (selected) => `${selected.name} capability becomes available across the organization`,
  (selected) => `${selected.name} intelligence begins to shape how the business competes`
];
const zazooHeadlines = [
  (selected) => `Zazoo brings relevant help into ${selected.name === "General" ? "everyday" : selected.name} work`,
  (selected) => `Zazoo makes managed AI dependable in ${selected.name === "General" ? "individual" : selected.name} work`,
  (selected) => `Zazoo turns proven ${selected.name === "General" ? "" : selected.name + " "}work into reusable capability`,
  (selected) => `Zazoo extends trusted ${selected.name === "General" ? "" : selected.name + " "}capability without weakening control`,
  (selected) => `Zazoo turns compounding ${selected.name === "General" ? "organizational" : selected.name} intelligence into advantage`
];

function getContent(functionId, stageIndex, zazooEnabled) {
  const selected = functions[functionId] ?? functions.general;
  const safeStage = Math.max(0, Math.min(stages.length - 1, stageIndex));

  if (zazooEnabled) {
    return {
      title: stages[safeStage].title,
      headline: zazooHeadlines[safeStage](selected),
      points: [
        selected.zazoo[safeStage],
        `Zazoo scales ${selected.scale[safeStage]} through shared context, memory, governance, and coordinated execution.`,
        `Progress is measured through ${selected.measures[safeStage]}.`
      ]
    };
  }

  return {
    title: stages[safeStage].title,
    headline: functionId === "general"
      ? generalHeadlines[safeStage]
      : functionHeadlines[safeStage](selected),
    points: [
      stackDescriptions[safeStage](selected),
      `The stack scales ${selected.scale[safeStage]}, while every connection, update, permission, exception, and failure path remains a separate operating responsibility.`,
      `Progress is measured through ${selected.measures[safeStage]}.`
    ]
  };
}

const maturityModelData = { stages, functions, getContent };
root.MaturityModelData = maturityModelData;

if (typeof module !== "undefined" && module.exports) {
  module.exports = maturityModelData;
}
})(typeof window !== "undefined" ? window : globalThis);
