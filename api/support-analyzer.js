export default function handler(req, res) {
  const { issue_category, account_type, time_sensitivity, customer_sentiment, repeat_issue } = req.body;
  
  // 10 PREDEFINED SCENARIOS - API chooses which to return
  const scenarios = [
    {
      // Scenario 1: Account locked + premium + immediate
      match: (i, a, t) => i === "account_access" && a === "premium" && t === "immediate",
      response: {
        priority_score: 9.5,
        priority_level: "URGENT",
        recommended_action: "escalate_to_human",
        routing_team: "senior_support",
        sla_deadline: "2_minutes",
        reasoning: "Premium account locked with immediate time constraint",
        ticket_id: "TKT-URG-ACC01"
      }
    },
    {
      // Scenario 2: Billing + enterprise
      match: (i, a, t) => i === "billing" && a === "enterprise",
      response: {
        priority_score: 9.0,
        priority_level: "URGENT",
        recommended_action: "escalate_to_human",
        routing_team: "billing_team",
        sla_deadline: "15_minutes",
        reasoning: "Enterprise billing issue - revenue impact",
        ticket_id: "TKT-URG-BILL02"
      }
    },
    {
      // Scenario 3: Password reset + free
      match: (i, a, t) => i === "password_reset" && a === "free",
      response: {
        priority_score: 4.0,
        priority_level: "NORMAL",
        recommended_action: "knowledge_base",
        routing_team: "self_service",
        sla_deadline: "immediate",
        reasoning: "Standard password reset - self-service available",
        ticket_id: "TKT-STD-PWD03"
      }
    },
    {
      // Scenario 4: Feature request (any account)
      match: (i, a, t) => i === "feature_request",
      response: {
        priority_score: 2.0,
        priority_level: "LOW",
        recommended_action: "log_ticket",
        routing_team: "product_team",
        sla_deadline: "1-2_weeks",
        reasoning: "Feature suggestion for product roadmap",
        ticket_id: "TKT-FEAT-REQ04"
      }
    },
    {
      // Scenario 5: Any repeat issue = boost priority
      match: (i, a, t, s, r) => r === "yes",
      response: {
        priority_score: 8.5,
        priority_level: "URGENT",
        recommended_action: "escalate_to_human",
        routing_team: "senior_support",
        sla_deadline: "30_minutes",
        reasoning: "Repeat issue - customer reported this before, escalating to prevent churn",
        ticket_id: "TKT-RPT-ISS05"
      }
    },
    {
      // Scenario 6: Bug + standard = NORMAL
      match: (i, a, t) => i === "technical_bug" && a === "standard",
      response: {
        priority_score: 5.5,
        priority_level: "NORMAL",
        recommended_action: "knowledge_base",
        routing_team: "technical_support",
        sla_deadline: "4_hours",
        reasoning: "Technical bug for standard account - check KB first",
        ticket_id: "TKT-BUG-STD06"
      }
    },
    {
      // Scenario 7: Documentation request
      match: (i, a, t) => i === "general_question",
      response: {
        priority_score: 3.0,
        priority_level: "NORMAL",
        recommended_action: "knowledge_base",
        routing_team: "self_service",
        sla_deadline: "immediate",
        reasoning: "General question - documentation available",
        ticket_id: "TKT-DOC-REQ07"
      }
    },
    {
      // Scenario 8: Account access + free + normal = NORMAL (not urgent)
      match: (i, a, t) => i === "account_access" && a === "free" && t !== "immediate",
      response: {
        priority_score: 6.0,
        priority_level: "NORMAL",
        recommended_action: "knowledge_base",
        routing_team: "support",
        sla_deadline: "2_hours",
        reasoning: "Account access for free tier - standard priority",
        ticket_id: "TKT-ACC-FREE08"
      }
    },
    {
      // Scenario 9: Angry customer (any issue)
      match: (i, a, t, s) => s === "angry",
      response: {
        priority_score: 7.5,
        priority_level: "URGENT",
        recommended_action: "escalate_to_human",
        routing_team: "customer_success",
        sla_deadline: "15_minutes",
        reasoning: "Customer satisfaction risk - angry sentiment detected",
        ticket_id: "TKT-SAT-ANG09"
      }
    },
    {
      // Scenario 10: Default fallback
      match: () => true, // Always matches as fallback
      response: {
        priority_score: 5.0,
        priority_level: "NORMAL",
        recommended_action: "knowledge_base",
        routing_team: "support",
        sla_deadline: "4_hours",
        reasoning: "Standard support request",
        ticket_id: "TKT-STD-DEF10"
      }
    }
  ];
  
  // Find first matching scenario
  const matched = scenarios.find(s => 
    s.match(issue_category, account_type, time_sensitivity, customer_sentiment, repeat_issue)
  );
  
  // Add dynamic ticket ID
  const response = { ...matched.response };
  response.ticket_id = response.ticket_id.replace(/\d+$/, Math.random().toString().substr(2, 5));
  
  return res.json(response);
}