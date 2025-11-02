import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const sampleClients = [
  {
    fullName: "John Smith",
    company: "ABC Roofing",
    email: "john@abcroofing.com",
    phone: "(555) 123-4567",
    street: "123 Main Street",
    city: "Denver",
    state: "CO",
    zipCode: "80202"
  },
  {
    fullName: "Sarah Johnson",
    company: "Johnson Construction",
    email: "sarah@johnsonconstruction.com",
    phone: "(555) 234-5678",
    street: "456 Oak Avenue",
    city: "Boulder",
    state: "CO",
    zipCode: "80301"
  },
  {
    fullName: "Michael Brown",
    company: "Brown & Associates",
    email: "michael@brownassociates.com",
    phone: "(555) 345-6789",
    street: "789 Pine Road",
    city: "Colorado Springs",
    state: "CO",
    zipCode: "80903"
  },
  {
    fullName: "Emily Davis",
    company: "Davis Builders",
    email: "emily@davisbuilders.com",
    phone: "(555) 456-7890",
    street: "321 Elm Street",
    city: "Fort Collins",
    state: "CO",
    zipCode: "80521"
  },
  {
    fullName: "David Wilson",
    company: "Wilson Roofing Co",
    email: "david@wilsonroofing.com",
    phone: "(555) 567-8901",
    street: "654 Maple Drive",
    city: "Aurora",
    state: "CO",
    zipCode: "80012"
  },
  {
    fullName: "Jennifer Martinez",
    company: "Martinez Contracting",
    email: "jennifer@martinezcontracting.com",
    phone: "(555) 678-9012",
    street: "987 Birch Lane",
    city: "Lakewood",
    state: "CO",
    zipCode: "80226"
  },
  {
    fullName: "Robert Anderson",
    company: "Anderson Homes",
    email: "robert@andersonhomes.com",
    phone: "(555) 789-0123",
    street: "147 Cedar Court",
    city: "Westminster",
    state: "CO",
    zipCode: "80031"
  },
  {
    fullName: "Lisa Taylor",
    company: "Taylor Construction",
    email: "lisa@taylorconstruction.com",
    phone: "(555) 890-1234",
    street: "258 Spruce Way",
    city: "Thornton",
    state: "CO",
    zipCode: "80229"
  },
  {
    fullName: "William Thomas",
    company: "Thomas Roofing",
    email: "william@thomasroofing.com",
    phone: "(555) 901-2345",
    street: "369 Aspen Circle",
    city: "Arvada",
    state: "CO",
    zipCode: "80002"
  },
  {
    fullName: "Mary Jackson",
    company: "Jackson Builders",
    email: "mary@jacksonbuilders.com",
    phone: "(555) 012-3456",
    street: "741 Willow Street",
    city: "Pueblo",
    state: "CO",
    zipCode: "81003"
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if any clients already exist for this organization
    const existingClients = await base44.entities.Client.filter({
      orgId: user.orgId
    });
    
    if (existingClients.length > 0) {
      return Response.json({
        success: false,
        message: `Test data already exists. Found ${existingClients.length} existing clients.`,
        clientCount: existingClients.length
      });
    }
    
    // Create all sample clients
    const createdClients = [];
    
    for (const sampleClient of sampleClients) {
      const client = await base44.entities.Client.create({
        ...sampleClient,
        orgId: user.orgId,
        ownerId: user.id
      });
      createdClients.push(client);
    }
    
    return Response.json({
      success: true,
      message: `Successfully created ${createdClients.length} sample clients!`,
      clientCount: createdClients.length,
      clients: createdClients
    });
    
  } catch (error) {
    console.error('Error in seedTestData:', error);
    return Response.json(
      { 
        success: false,
        error: error.message || 'Failed to seed test data' 
      },
      { status: 500 }
    );
  }
});