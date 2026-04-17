import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * seedTestData — RE/Mortgage Demo Clients
 *
 * Creates 30 realistic real estate and mortgage client records for testing.
 * Includes all four automation date fields:
 *   - birthday              (birthday campaign — recurring)
 *   - home_anniversary_date (home anniversary campaign — recurring, RE)
 *   - close_date            (post-close campaign — one-time, RE)
 *   - loan_anniversary_date (loan anniversary campaign — recurring, mortgage)
 *
 * NOTE: home_anniversary_date, close_date, and loan_anniversary_date must be
 * added to the Client entity schema before those campaigns can query them.
 * The data seeds correctly either way — entity schema is the blocker for live
 * campaign firing, not this function.
 *
 * Dates are set relative to 2026 so multiple automation windows are active
 * for testing: several birthdays within the next 30 days, recent close dates
 * for post-close triggers, and anniversaries coming up across April-July.
 *
 * Idempotent: skips if clients already exist for the org.
 */

// ─────────────────────────────────────────────────────────────
// CLIENT DATA
// ─────────────────────────────────────────────────────────────

const RE_CLIENTS = [
  // ── RECENT CLOSES (post-close cards should fire) ──────────────
  {
    firstName: 'James',
    lastName: 'Hendricks',
    company: '',
    email: 'james.hendricks@gmail.com',
    phone: '(925) 441-2201',
    street: '4412 Sunridge Court',
    city: 'Walnut Creek',
    state: 'CA',
    zipCode: '94598',
    birthday: '1978-06-15',
    close_date: '2026-03-28',
    home_anniversary_date: '2026-03-28',
    tags: ['buyer', 'referral-source'],
    notes: 'Referred by Karen Westbrook. Very smooth close.'
  },
  {
    firstName: 'Chloe',
    lastName: 'Winters',
    company: '',
    email: 'chloe.winters@outlook.com',
    phone: '(415) 882-0034',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    birthday: '1996-03-31',
    close_date: '2026-04-01',
    home_anniversary_date: '2026-04-01',
    tags: ['buyer', 'first-time'],
    notes: 'Address incomplete — intentional test record for mailing validation. First-time buyer, very excited.'
  },
  {
    firstName: 'Heather',
    lastName: 'Lundgren',
    company: '',
    email: 'heather.lundgren@gmail.com',
    phone: '(510) 773-9256',
    street: '218 Elmwood Drive',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94602',
    birthday: '1994-07-19',
    close_date: '2026-02-14',
    home_anniversary_date: '2026-02-14',
    tags: ['buyer', 'first-time'],
    notes: 'First-time buyer. Closed on Valentines Day — great story.'
  },
  {
    firstName: 'Tyler',
    lastName: 'Nakamura',
    company: '',
    email: 'tyler.nakamura@icloud.com',
    phone: '(925) 504-3317',
    street: '731 Ridgecrest Terrace',
    city: 'Concord',
    state: 'CA',
    zipCode: '94521',
    birthday: '1992-04-25',
    close_date: '2026-01-15',
    home_anniversary_date: '2026-01-15',
    tags: ['buyer'],
    notes: 'Birthday coming up April 25. Smooth close, easy client.'
  },

  // ── HOME ANNIVERSARIES COMING UP (April–June 2026) ───────────
  {
    firstName: 'Marcus',
    lastName: 'Webb',
    company: '',
    email: 'marcus.webb@gmail.com',
    phone: '(510) 229-4401',
    street: '3890 Grizzly Peak Blvd',
    city: 'Berkeley',
    state: 'CA',
    zipCode: '94708',
    birthday: '1985-09-22',
    close_date: '2025-04-10',
    home_anniversary_date: '2025-04-10',
    tags: ['buyer'],
    notes: 'One-year anniversary coming up April 10.'
  },
  {
    firstName: 'Paul',
    lastName: 'Marchetti',
    company: '',
    email: 'paul.marchetti@comcast.net',
    phone: '(925) 338-8820',
    street: '55 Via Moraga',
    city: 'Orinda',
    state: 'CA',
    zipCode: '94563',
    birthday: '1955-08-07',
    close_date: '2025-04-20',
    home_anniversary_date: '2025-04-20',
    tags: ['buyer', 'downsizer'],
    notes: 'Downsized from 5-bed in Lafayette. Anniversary April 20.'
  },
  {
    firstName: 'Sofia',
    lastName: 'Reyes',
    company: '',
    email: 'sofia.reyes@yahoo.com',
    phone: '(510) 667-3392',
    street: '1425 Tunnel Road',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94611',
    birthday: '1990-04-20',
    close_date: '2024-11-05',
    home_anniversary_date: '2024-11-05',
    tags: ['buyer', 'past-client'],
    notes: 'Birthday April 20 — very soon! Referred one client already.'
  },
  {
    firstName: 'Nathan',
    lastName: 'Cho',
    company: '',
    email: 'ncho@gmail.com',
    phone: '(415) 901-5523',
    street: '882 Panoramic Way',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94131',
    birthday: '1991-05-08',
    close_date: '2025-06-30',
    home_anniversary_date: '2025-06-30',
    tags: ['buyer'],
    notes: 'Birthday May 8. Anniversary coming up in June.'
  },

  // ── PAST CLIENTS — LONGER TERM ────────────────────────────────
  {
    firstName: 'Carol',
    lastName: 'Simmons',
    company: '',
    email: 'carol.simmons@sbcglobal.net',
    phone: '(925) 722-1194',
    street: '76 Sycamore Valley Road',
    city: 'Danville',
    state: 'CA',
    zipCode: '94526',
    birthday: '1965-05-01',
    close_date: '2023-05-18',
    home_anniversary_date: '2023-05-18',
    tags: ['buyer', 'past-client', 'referral-source'],
    notes: 'Three-year homeowner. Has sent two referrals. Birthday May 1.'
  },
  {
    firstName: 'Derek',
    lastName: 'Foster',
    company: '',
    email: 'derek.foster@gmail.com',
    phone: '(510) 443-7701',
    street: '241 Fernwood Drive',
    city: 'Piedmont',
    state: 'CA',
    zipCode: '94611',
    birthday: '1980-12-03',
    close_date: '2025-07-22',
    home_anniversary_date: '2025-07-22',
    tags: ['buyer'],
    notes: 'Moved up from condo. Anniversary in July.'
  },
  {
    firstName: 'Brandon',
    lastName: 'Okafor',
    company: '',
    email: 'brandon.okafor@outlook.com',
    phone: '(925) 558-8821',
    street: '9017 Bollinger Canyon Rd',
    city: 'San Ramon',
    state: 'CA',
    zipCode: '94583',
    birthday: '1988-01-14',
    close_date: '2025-09-30',
    home_anniversary_date: '2025-09-30',
    tags: ['buyer'],
    notes: 'Investor profile, owns two other properties.'
  },
  {
    firstName: 'Vanessa',
    lastName: 'Tran',
    company: 'Tran Investment Properties',
    email: 'vanessa@tranip.com',
    phone: '(510) 209-3345',
    street: '4200 Park Blvd',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94602',
    birthday: '1982-11-28',
    close_date: '2024-06-01',
    home_anniversary_date: '2024-06-01',
    tags: ['investor', 'past-client'],
    notes: 'Closed on duplex in 2024. Shopping for a third property.'
  },
  {
    firstName: 'Ryan',
    lastName: 'Gutierrez',
    company: '',
    email: 'ryan.gutierrez@gmail.com',
    phone: '(925) 312-4455',
    street: '1822 Olympic Blvd',
    city: 'Walnut Creek',
    state: 'CA',
    zipCode: '94596',
    birthday: '1987-10-15',
    close_date: '2025-12-05',
    home_anniversary_date: '2025-12-05',
    tags: ['buyer'],
    notes: ''
  },
  {
    firstName: 'Amanda',
    lastName: 'Perkins',
    company: '',
    email: 'aperkins@yahoo.com',
    phone: '(510) 331-8823',
    street: '633 Colton Blvd',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94610',
    birthday: '1983-02-22',
    close_date: '2024-08-14',
    home_anniversary_date: '2024-08-14',
    tags: ['buyer', 'past-client'],
    notes: 'Purchased in Montclair. Great Zillow review left.'
  },
  {
    firstName: 'Jessica',
    lastName: 'Alvarez',
    company: '',
    email: 'jessica.alvarez@icloud.com',
    phone: '(925) 229-3341',
    street: '57 Stone Valley Road',
    city: 'Alamo',
    state: 'CA',
    zipCode: '94507',
    birthday: '1979-09-17',
    close_date: '2023-11-10',
    home_anniversary_date: '2023-11-10',
    tags: ['buyer', 'past-client'],
    notes: 'Has referred her sister who is actively looking.'
  },
  {
    firstName: 'Chris',
    lastName: 'Norman',
    company: '',
    email: 'chris.norman@gmail.com',
    phone: '(510) 778-5512',
    street: '301 Jean Street',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94611',
    birthday: '1972-04-30',
    close_date: '2024-03-05',
    home_anniversary_date: '2024-03-05',
    tags: ['buyer', 'past-client'],
    notes: 'Birthday April 30 — coming up soon. Two-year homeowner.'
  },
  {
    firstName: 'Sarah',
    lastName: 'Okonkwo',
    company: '',
    email: 's.okonkwo@gmail.com',
    phone: '(925) 874-2201',
    street: '18 Ridgewood Court',
    city: 'Pleasanton',
    state: 'CA',
    zipCode: '94566',
    birthday: '1986-08-14',
    close_date: '2025-02-01',
    home_anniversary_date: '2025-02-01',
    tags: ['buyer'],
    notes: 'Moved from out of state. Great client to stay in touch with.'
  },
  {
    firstName: 'Michael',
    lastName: 'Castillo',
    company: '',
    email: 'mcastillo@outlook.com',
    phone: '(510) 443-9920',
    street: '2271 MacArthur Blvd',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94602',
    birthday: '1990-03-07',
    close_date: '2024-10-18',
    home_anniversary_date: '2024-10-18',
    tags: ['buyer'],
    notes: ''
  }
];

const MORTGAGE_CLIENTS = [
  // ── RECENT LOAN CLOSES ─────────────────────────────────────────
  {
    firstName: 'Maria',
    lastName: 'Dominguez',
    company: '',
    email: 'maria.dominguez@gmail.com',
    phone: '(925) 501-7723',
    street: '4488 Clayton Road',
    city: 'Concord',
    state: 'CA',
    zipCode: '94521',
    birthday: '1988-12-05',
    close_date: '2026-02-28',
    loan_anniversary_date: '2026-02-28',
    tags: ['loan-purchase', 'first-time'],
    notes: 'First purchase loan. Smooth close. Great candidate for referral ask.'
  },
  {
    firstName: 'Olivia',
    lastName: 'Fontaine',
    company: '',
    email: 'olivia.fontaine@icloud.com',
    phone: '(415) 220-9901',
    street: '812 Castro Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94114',
    birthday: '1993-11-11',
    close_date: '2026-01-30',
    loan_anniversary_date: '2026-01-30',
    tags: ['loan-purchase'],
    notes: ''
  },

  // ── LOAN ANNIVERSARIES COMING UP ──────────────────────────────
  {
    firstName: 'Kevin',
    lastName: 'Shea',
    company: '',
    email: 'kevin.shea@comcast.net',
    phone: '(925) 773-4420',
    street: '3301 Willow Pass Road',
    city: 'Concord',
    state: 'CA',
    zipCode: '94519',
    birthday: '1975-08-20',
    close_date: '2025-04-08',
    loan_anniversary_date: '2025-04-08',
    tags: ['loan-purchase', 'past-client'],
    notes: 'One-year loan anniversary came up April 8 — good send opportunity.'
  },
  {
    firstName: 'Alex',
    lastName: 'Patel',
    company: '',
    email: 'alex.patel@gmail.com',
    phone: '(510) 882-0034',
    street: '277 Alamo Drive',
    city: 'Alamo',
    state: 'CA',
    zipCode: '94507',
    birthday: '1984-04-18',
    close_date: '2025-10-14',
    loan_anniversary_date: '2025-10-14',
    tags: ['loan-purchase', 'jumbo'],
    notes: 'Jumbo loan. Birthday April 18 — two days away!'
  },
  {
    firstName: 'Tim',
    lastName: 'Bauer',
    company: '',
    email: 'tim.bauer@yahoo.com',
    phone: '(925) 441-5501',
    street: '95 Camino Encinas',
    city: 'Orinda',
    state: 'CA',
    zipCode: '94563',
    birthday: '1969-06-25',
    close_date: '2025-07-02',
    loan_anniversary_date: '2025-07-02',
    tags: ['loan-purchase'],
    notes: 'Loan anniversary in July. Long-time area resident.'
  },

  // ── REFINANCE CLIENTS ─────────────────────────────────────────
  {
    firstName: 'Steve',
    lastName: 'Kowalski',
    company: '',
    email: 'stevekowalski@gmail.com',
    phone: '(925) 338-7712',
    street: '1609 Treat Blvd',
    city: 'Walnut Creek',
    state: 'CA',
    zipCode: '94597',
    birthday: '1977-03-14',
    close_date: '2024-11-19',
    loan_anniversary_date: '2024-11-19',
    tags: ['refinance', 'past-client'],
    notes: 'Rate-term refi. Saved $340/mo. Good review candidate.'
  },
  {
    firstName: 'Rachel',
    lastName: 'Kim',
    company: '',
    email: 'rachel.kim@outlook.com',
    phone: '(510) 229-5544',
    street: '6622 Moraga Avenue',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94611',
    birthday: '1995-07-04',
    close_date: '2025-03-05',
    loan_anniversary_date: '2025-03-05',
    tags: ['refinance'],
    notes: 'Cash-out refi for home improvement. Anniversary in March.'
  },
  {
    firstName: 'Daniel',
    lastName: 'Thornton',
    company: '',
    email: 'dthornton@gmail.com',
    phone: '(925) 501-3340',
    street: '3410 Blackhawk Plaza Circle',
    city: 'Danville',
    state: 'CA',
    zipCode: '94506',
    birthday: '1980-05-16',
    close_date: '2025-08-22',
    loan_anniversary_date: '2025-08-22',
    tags: ['loan-purchase'],
    notes: 'High-value purchase. Very detail-oriented client.'
  }
];

const SOI_CLIENTS = [
  {
    firstName: 'Bob',
    lastName: 'Martinez',
    company: 'Martinez & Associates Law',
    email: 'bob@martinezlaw.com',
    phone: '(925) 938-1122',
    street: '1350 Treat Blvd, Ste 200',
    city: 'Walnut Creek',
    state: 'CA',
    zipCode: '94597',
    birthday: '1960-04-22',
    tags: ['referral-partner', 'attorney'],
    notes: 'Real estate attorney. Refers 2-3 clients per year. Birthday April 22 — very soon!'
  },
  {
    firstName: 'Karen',
    lastName: 'Westbrook',
    company: 'Westbrook Financial Planning',
    email: 'karen@westbrookfp.com',
    phone: '(925) 274-5533',
    street: '2999 Oak Road, Ste 100',
    city: 'Walnut Creek',
    state: 'CA',
    zipCode: '94597',
    birthday: '1968-07-30',
    tags: ['referral-partner', 'financial-planner'],
    notes: 'Strong referral relationship. Sends pre-retirement clients looking to downsize.'
  },
  {
    firstName: 'Greg',
    lastName: 'Harlow',
    company: '',
    email: 'greg.harlow@gmail.com',
    phone: '(925) 441-7892',
    street: '721 Bancroft Road',
    city: 'Walnut Creek',
    state: 'CA',
    zipCode: '94598',
    birthday: '1958-11-02',
    tags: ['past-client', 'referral-source', 'soi'],
    notes: 'Past buyer from 2019. Has referred four clients. Top sphere contact.'
  },
  {
    firstName: 'Ingrid',
    lastName: 'Nielsen',
    company: 'Nielsen Staging & Design',
    email: 'ingrid@nielsenstaging.com',
    phone: '(510) 881-3340',
    street: '900 Broadway',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94607',
    birthday: '1975-01-19',
    tags: ['vendor-partner', 'stager', 'soi'],
    notes: 'Home stager. Great referral synergy. Keep in touch quarterly.'
  },
  {
    firstName: 'Carlos',
    lastName: 'Espinoza',
    company: '',
    email: 'carlos.espinoza@icloud.com',
    phone: '(925) 552-8811',
    street: '45 Morello Avenue',
    city: 'Martinez',
    state: 'CA',
    zipCode: '94553',
    birthday: '1985-09-05',
    tags: ['soi', 'neighbor-referral'],
    notes: 'Neighbor of past client. Met at open house. Warm lead for listing.'
  },
  {
    firstName: 'Donna',
    lastName: 'Pierce',
    company: '',
    email: 'donna.pierce@gmail.com',
    phone: '(925) 338-9904',
    street: '88 La Casa Via',
    city: 'Walnut Creek',
    state: 'CA',
    zipCode: '94598',
    birthday: '1970-06-08',
    tags: ['soi'],
    notes: 'Met at chamber event. Sphere contact, not yet a client.'
  }
];

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let orgId = user.orgId;

    if (!orgId) {
      const orgName = user.companyName || `${user.fullName || user.full_name || 'New'}'s Organization`;
      const newOrg = await base44.asServiceRole.entities.Organization.create({
        name: orgName,
        creditBalance: 0
      });
      orgId = newOrg.id;
      await base44.auth.updateMe({ orgId });
    }

    // Idempotency check
    const existingClients = await base44.entities.Client.filter({ orgId });
    if (existingClients.length > 0) {
      return Response.json({
        success: false,
        message: `Test data already exists. Found ${existingClients.length} existing clients. Delete them first to re-seed.`,
        clientCount: existingClients.length
      });
    }

    const allClients = [...RE_CLIENTS, ...MORTGAGE_CLIENTS, ...SOI_CLIENTS];
    const created = [];

    for (const c of allClients) {
      const firstName = c.firstName || 'Test';
      const lastName = c.lastName || 'Client';
      const fullName = `${firstName} ${lastName}`;

      const record = await base44.entities.Client.create({
        ...c,
        firstName,
        lastName,
        fullName,
        orgId,
        ownerId: user.id,
        automation_status: 'active'
      });
      created.push(record);
    }

    return Response.json({
      success: true,
      message: `Created ${created.length} demo clients (${RE_CLIENTS.length} real estate, ${MORTGAGE_CLIENTS.length} mortgage, ${SOI_CLIENTS.length} sphere).`,
      clientCount: created.length,
      breakdown: {
        real_estate: RE_CLIENTS.length,
        mortgage: MORTGAGE_CLIENTS.length,
        soi: SOI_CLIENTS.length
      }
    });

  } catch (error) {
    console.error('Error in seedTestData:', error);
    return Response.json(
      { success: false, error: error.message || 'Failed to seed test data' },
      { status: 500 }
    );
  }
});