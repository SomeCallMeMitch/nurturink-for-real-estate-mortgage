# NurturInk Automated Campaigns V1 - Planning Documents

This folder contains the complete planning documentation for the Automated Campaigns V1 feature.

## Documents

### 1. TECHNICAL_SPEC.md
**Complete technical specification** covering:
- Data model (entities, fields, relationships)
- User interface (pages, components, workflows)
- Backend functions (CRUD, scheduling, sending)
- Background jobs (Daily Scheduler, Send Processor, Notifications)
- Credit management
- Testing strategy
- Security considerations
- Performance optimization

**Read this first** to understand the full system architecture.

### 2. IMPLEMENTATION_ROADMAP.md
**6-phase implementation plan** with:
- Phase-by-phase breakdown (Foundation → UI → Enrollment → Automation → Polish → Launch)
- Detailed tasks for each phase
- Acceptance criteria
- Testing checklists
- Deliverables
- Timeline estimates (7-10 weeks total)

**Use this as your execution guide** - follow phases sequentially.

### 3. QUICK_START_GUIDE.md
**Quick reference for Manus Max** with:
- High-level overview
- Key technical decisions
- Critical implementation details
- Common pitfalls to avoid
- Testing checklist
- Success criteria

**Read this for a quick orientation** before diving into the detailed docs.

---

## Quick Links

- **Project Context:** NurturInk handwritten card platform (Base44)
- **Target User:** Insurance agents (NYL office pilot)
- **Timeline:** 7-10 weeks
- **Phases:** 6 (Foundation → UI → Enrollment → Automation → Polish → Launch)

---

## Implementation Approach

1. **Read:** TECHNICAL_SPEC.md (understand the system)
2. **Plan:** IMPLEMENTATION_ROADMAP.md (understand the phases)
3. **Execute:** Follow roadmap phase-by-phase
4. **Test:** After each phase (don't wait until the end)
5. **Deploy:** Push to GitHub, let Base44 sync

---

## Key Decisions Made

- **Timezone:** Org timezone (V1), client timezone (V2)
- **Campaign edits:** Only affect future sends
- **Client date changes:** Don't auto-reschedule
- **Send time:** Every 2 hours, 6am-6pm
- **Look-ahead window:** 14 days
- **Calendar view:** Defer to V2
- **Approve mode:** Inform-only (V1), approve mode (V2)
- **Credit reservation:** No reservation (V1)

---

## Success Criteria

**User Experience:**
- Create Birthday campaign in <5 minutes
- Create Welcome sequence in <10 minutes
- Create Renewal reminder in <5 minutes
- See all upcoming sends
- Easily manage enrollment
- Import clients with dates
- Get notified of sends and low credits

**System Reliability:**
- Auto-schedule based on dates
- Process sends daily
- Handle new recipients
- Prevent sends when no credits
- Maintain send history
- Handle failures gracefully

---

## Questions?

If you need clarification during implementation:
1. Check TECHNICAL_SPEC.md for detailed specs
2. Check IMPLEMENTATION_ROADMAP.md for task details
3. Ask the user for clarification
4. Document any new decisions

---

**Ready to build! 🚀**
