/**
 * dream100Prompts.js
 * Builds the 7 personalized AI prompt objects from wizard formData.
 * Ported directly from the HTML script section — same logic, same copy.
 */

function getLLMNote(llm) {
  const m = {
    'ChatGPT': 'Format your response with clear section headers and bullet points where helpful. Be specific to the niche and market provided.',
    'Claude (Anthropic)': 'Use markdown formatting with clear headers. Prioritize strategic depth and specificity. Avoid generic advice. Deliver exactly the deliverables described.',
    'Perplexity': 'Search for real, currently active businesses and professionals in the specified geographic area. Cite sources. Prioritize actionable, locally specific intelligence.',
    'Gemini': 'Respond in clearly organized sections. Ground your response in the specific niche and market. Use examples wherever possible.',
    'Grok (xAI)': 'Be direct and specific. Avoid generic advice. Ground every recommendation in the specific niche and geographic market provided. Format with clear section headers.',
    "I'm not sure yet": 'Format your response with clear section headers. Be specific to the niche and market. Avoid generic real estate advice.',
  };
  return m[llm] || m['ChatGPT'];
}

export function buildPrompts(formData) {
  const n         = formData.name      || 'I';
  const niche     = formData.niche     || 'General Residential';
  const geo       = formData.geo       || 'my market area';
  const client    = formData.client    ? formData.client : `buyers and sellers in the ${niche} segment`;
  const challenge = formData.challenge || 'building consistent referral partner relationships';
  const years     = formData.years     || '';
  const llm       = formData.llm       || 'ChatGPT';
  const llmNote   = getLLMNote(llm);

  return [
    {
      title: 'Lifecycle Trigger Mapping',
      model: llm,
      modelNote: `Optimized for ${llm}. ${llmNote}`,
      prompt: `You are a Strategic Alliances Director specializing in real estate referral systems.

MY CONTEXT:
- Real estate niche: ${niche}
- Market area: ${geo}
- Ideal client: ${client}
- Referral challenge: ${challenge}
${years ? `- My experience: ${years}` : ''}

PHASE 1 TASK — Lifecycle Trigger Mapping

Map the complete lifecycle of my ideal real estate client. Identify every major life event, financial trigger, and transition point that causes someone in the ${niche} segment to buy, sell, or move in ${geo}.

For each trigger event provide:
1. The trigger itself (be specific — e.g., "filing for divorce," "receiving an inheritance," "child leaves for college")
2. How far before a real estate transaction this typically occurs
3. Which professional type sees the client at this trigger point BEFORE they contact a realtor
4. Why that professional has high trust with the client at that exact moment

DELIVERABLE:
A Lifecycle Trigger Map formatted as a table:
| Trigger Event | Months Before Transaction | Upstream Professional | Why They Have High Trust |

Include at least 12 distinct trigger events specific to ${niche} clients in ${geo}.
Mark the top 3 highest-leverage triggers with a ★ and explain why they are the priority.

${llmNote}`,
    },
    {
      title: 'Upstream & Side-stream Partner Mapping',
      model: llm,
      modelNote: `Optimized for ${llm}. ${llmNote}`,
      prompt: `You are a Strategic Alliances Director specializing in real estate referral systems.

MY CONTEXT:
- Real estate niche: ${niche}
- Market area: ${geo}
- Ideal client: ${client}

PHASE 2 TASK — Upstream & Side-stream Partner Mapping

Using the lifecycle triggers from Phase 1, identify the specific types of referral partners I should target.

UPSTREAM PARTNERS (see the client 3–12 months before a real estate transaction):
For each type provide:
— Why they see my ideal ${niche} client early
— The specific problem they're solving for that client at that moment
— What a ${niche} specialist in ${geo} can offer them in return (the value exchange that makes this a real partnership, not just a referral ask)
— Estimated monthly referral frequency

SIDE-STREAM PARTNERS (see the client during the transaction itself):
Same format as above.

Then identify the top 3 UNDERUTILIZED partner types for ${niche} in ${geo} that most agents overlook, and explain why they are high-value and underserved.

DELIVERABLE:
Organized lists with clear headers. Include 8–10 upstream types and 4–6 side-stream types. Each must include the specific value exchange idea — what I give them, not just what I want from them.

${llmNote}`,
    },
    {
      title: 'Dream 10 Tier Ranking & Shortlist',
      model: llm,
      modelNote: `Optimized for ${llm}. ${llmNote}`,
      prompt: `You are a Strategic Alliances Director specializing in real estate referral systems.

MY CONTEXT:
- Real estate niche: ${niche}
- Market area: ${geo}
- Ideal client: ${client}

PHASE 3 TASK — Dream 10 Tier Ranking & Shortlist

Using the partner types from Phase 2, build my prioritized Dream 10 Strategic Partner Map.

TIER STRUCTURE:
— Tier 1 (Direct Upstream): Partners who see clients immediately before a transaction trigger — highest priority
— Tier 2 (Lifestyle & Transition): Partners who see clients during a life phase shift — medium priority
— Tier 3 (Community & Maintenance): Partners with consistent long-term client contact — relationship plays

BUILD THE DREAM 10 SHORTLIST:
Select the 10 highest-priority partner types for ${niche} in ${geo} and provide a table:

| Rank | Partner Type | Tier | Est. Monthly Referral Potential | Why Top Priority for ${niche} | First Contact Strategy |

Also answer:
What 3 personal characteristics should I look for when identifying which individual at each company to target (beyond just finding the business)? I want to build relationships with the right person inside each organization.

DELIVERABLE: The complete Dream 10 table plus the 3 individual selection criteria.

${llmNote}`,
    },
    {
      title: 'Gap Analysis & Value-First Positioning',
      model: llm,
      modelNote: `Optimized for ${llm}. ${llmNote}`,
      prompt: `You are a Strategic Alliances Director specializing in real estate referral systems.

MY CONTEXT:
- Real estate niche: ${niche}
- Market area: ${geo}
- My name: ${n}

PHASE 4 TASK — Gap Analysis & Value-First Positioning

The most effective way to build referral partnerships is to give value first until referrals happen naturally — not to ask for them up front.

For each of my top 6 partner types (from Phase 3), create a "Value Strategy Card" that includes:

1. THE GAP: What is currently missing from this partner's client service that a ${niche} specialist in ${geo} can fill?

2. THE VALUE GIFT: What specific, tangible asset can ${n} create or offer to start the relationship with no ask?
(Examples: a co-branded neighborhood market report, a "preparing an estate home for sale" checklist, a first-time buyer education guide, a market update they can share with their clients)

3. THE RECURRING TOUCHPOINT: After the first gift, what ongoing value can ${n} deliver monthly or quarterly to keep the relationship warm?

Then write a 3-paragraph "Value Manifesto" — a positioning statement ${n} could use when meeting new referral partners in person. It should focus entirely on how ${n} serves the partner's clients, not on promoting ${n}'s own production.

DELIVERABLE: 6 Value Strategy Cards + the Value Manifesto paragraph.

${llmNote}`,
    },
    {
      title: 'Objection Anticipation & Response Prep',
      model: llm,
      modelNote: `Optimized for ${llm}. ${llmNote}`,
      prompt: `You are a Strategic Alliances Director specializing in real estate referral systems.

MY CONTEXT:
- Real estate niche: ${niche}
- Market area: ${geo}
- My name: ${n}
- My challenge: ${challenge}

PHASE 5 TASK — Objection Anticipation & Response Prep

When I reach out to build referral partnerships, I will encounter resistance. Prepare me for every likely objection.

For each objection provide:
— WHY this objection comes up (the real fear or logic underneath it)
— A non-defensive, conversational response that reframes without being pushy
— A follow-up question that keeps the door open

OBJECTIONS TO ADDRESS:
1. "I already have a realtor I work with."
2. "I'm not in a position to refer clients right now."
3. "I don't want to refer someone and have it reflect badly on me."
4. "I don't encounter that many clients who need a realtor."
5. "I'm too busy to meet — can you just send me your card?"
6. "Can I think about it and get back to you?"
7. Two objections SPECIFIC to ${niche} referral partnerships that I might not think of

BONUS: Provide a "trust reset" script for re-approaching 2 situations: (a) a relationship that went cold after initial contact, and (b) a past referral relationship that ended badly.

TONE: Confident, low-pressure, peer-to-peer. Not salesy.

${llmNote}`,
    },
    {
      title: 'Complete Outreach Script Suite',
      model: llm,
      modelNote: `Optimized for ${llm}. ${llmNote}`,
      prompt: `You are a Strategic Alliances Director and copywriter specializing in real estate referral systems.

MY CONTEXT:
- Real estate niche: ${niche}
- Market area: ${geo}
- My name: ${n}
${years ? `- Experience: ${years}` : ''}

PHASE 6 TASK — Complete Outreach Script Suite

Write the full set of scripts ${n} will use to initiate and build referral partner relationships.

SCRIPT 1 — Cold Intro Email
Write 3 subject line options.
Email body (under 150 words): Focus on the partner's business, not ${n}'s needs. Mention a specific value gift. End with a low-commitment ask.

SCRIPT 2 — LinkedIn Connection Message
Under 300 characters. Reference something real about their work. Do not mention referrals.

SCRIPT 3 — Coffee/Zoom Invitation
4–6 sentences (text or email). Frame it around their business growth. Include a specific curiosity hook relevant to ${niche} in ${geo}.

SCRIPT 4 — The Handwritten Note Introduction
Write a 3–4 sentence handwritten note script that ${n} sends BEFORE any other outreach. This is the card that arrives in the mail before the email, before the call. It must feel completely personal — mention something specific about their business or a community connection. Zero sales language. This is the first impression that opens every door. (Note: NurturInk automates the physical sending of this card.)

SCRIPT 5 — Value-First Follow-Up
Brief message after delivering the value gift. Conversational. Plant the seed without making an ask.

SCRIPT 6 — Referral Thank-You Note
Warm, personal, non-templated note to send immediately after receiving a referral.

IMPORTANT: All scripts must sound like ${n} — warm, credible, peer-to-peer. No buzzwords or corporate-speak.

${llmNote}`,
    },
    {
      title: '90-Day Plan & Quarterly System',
      model: llm,
      modelNote: `Optimized for ${llm}. ${llmNote}`,
      prompt: `You are a Strategic Alliances Director specializing in real estate referral systems.

MY CONTEXT:
- Real estate niche: ${niche}
- Market area: ${geo}
- My name: ${n}

PHASE 7 TASK — 90-Day Launch Plan & Quarterly Reinforcement System

Build the complete execution system for turning my Dream 10 cold list into active referral advocates.

PART A — Week-by-Week 90-Day Sequence
For a new Tier 1 referral partner, give a week-by-week action plan for the first 90 days:
— Specific action
— Channel (handwritten note, email, phone, in-person, social media engagement)
— Goal of the touchpoint
— Time investment estimate

PART B — Relationship Tracker Template
Design a simple tracker structure for managing all 10 Dream partners. Include: partner name, tier, last contact date, next action, relationship stage (Cold / Warm / Active / Advocate), notes, and referral count.

PART C — 12-Month Quarterly Calendar
After a partner becomes active, what does ${n} do each quarter to maintain and deepen the relationship? Create a 4-quarter calendar of touchpoints, value gifts, and personal gestures. Include specific moments where a handwritten note is the highest-leverage move (quarterly check-in, referral thank-you, partner's business milestone, holiday).

PART D — 12-Month Production Math
Help ${n} set a realistic target: How many Dream 10 partnerships, at what referral frequency, would generate what level of closed volume? Walk through the math simply and conservatively.

DELIVERABLE: All four parts, specific and actionable. Built for a busy agent who needs a simple system they will actually follow.

${llmNote}`,
    },
  ];
}