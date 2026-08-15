export const categories = [
    {
        id: 'electrical',
        name: 'Electrical',
        icon: 'Zap',
        description: 'Wiring, switchboards, appliance installation, electrical repair',
        providerCount: 18,
        image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=600',
        fixedServices: [
            { id: 'e1', name: 'Fan Installation', priceRange: 'Rs. 500–1000' },
            { id: 'e2', name: 'Switch Replacement', priceRange: 'Rs. 300–700' },
            { id: 'e3', name: 'Light Installation', priceRange: 'Rs. 400–800' }
        ],
        inspectionServices: [
            'Wiring fault', 'Short circuit', 'Power outage', 'Fuse problem'
        ]
    },
    {
        id: 'plumbing',
        name: 'Plumbing',
        icon: 'Droplets',
        description: 'Pipe repairs, leak fixing, drain cleaning, installation',
        providerCount: 24,
        image: 'https://images.pexels.com/photos/8961065/pexels-photo-8961065.jpeg?auto=compress&cs=tinysrgb&w=600',
        fixedServices: [
            { id: 'p1', name: 'Tap Replacement', priceRange: 'Rs. 300–600' },
            { id: 'p2', name: 'Washbasin Installation', priceRange: 'Rs. 800–1500' },
            { id: 'p3', name: 'Shower Repair', priceRange: 'Rs. 400–900' }
        ],
        inspectionServices: [
            'Water leakage', 'Blocked drain', 'Low water pressure', 'Motor issue'
        ]
    },
    {
        id: 'cleaning',
        name: 'Cleaning',
        icon: 'Sparkles',
        description: 'Home cleaning, deep cleaning, office cleaning, carpet cleaning',
        providerCount: 31,
        image: 'https://images.pexels.com/photos/4107112/pexels-photo-4107112.jpeg?auto=compress&cs=tinysrgb&w=600',
        fixedServices: [
            { id: 'c1', name: 'Sofa Cleaning', priceRange: 'Rs. 800–1200' },
            { id: 'c2', name: 'Bathroom Cleaning', priceRange: 'Rs. 600–1000' },
            { id: 'c3', name: 'Carpet Cleaning', priceRange: 'Rs. 1000–2000' }
        ],
        inspectionServices: [
            'Full house deep cleaning assessment', 'Post-construction cleaning'
        ]
    },
    {
        id: 'appliance-repair',
        name: 'Appliance Repair',
        icon: 'Settings',
        description: 'AC servicing, fridge repair, washing machine, TV repair',
        providerCount: 15,
        image: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=600',
        fixedServices: [
            { id: 'a1', name: 'AC Servicing', priceRange: 'Rs. 1000–1500' },
            { id: 'a2', name: 'Washing Machine Installation', priceRange: 'Rs. 500–1000' },
            { id: 'a3', name: 'Water Purifier Filter Change', priceRange: 'Rs. 400–800' }
        ],
        inspectionServices: [
            'Fridge not cooling', 'Washing machine making noise', 'AC not turning on', 'Microwave heating issue'
        ]
    },
    {
        id: 'carpentry',
        name: 'Carpentry',
        icon: 'Hammer',
        description: 'Furniture repair, custom woodwork, door/window fitting',
        providerCount: 12,
        image: 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=600',
        fixedServices: [
            { id: 'ca1', name: 'Door Lock Installation', priceRange: 'Rs. 400–800' },
            { id: 'ca2', name: 'Hinge Replacement', priceRange: 'Rs. 200–500' },
            { id: 'ca3', name: 'Bed Assembly', priceRange: 'Rs. 600–1200' }
        ],
        inspectionServices: [
            'Custom furniture requirement', 'Squeaky wooden bed', 'Termite damaged wood repair'
        ]
    },
    {
        id: 'tutoring',
        name: 'Tutoring',
        icon: 'BookOpen',
        description: 'Professional mathematics, science, English, and test prep home tuition',
        providerCount: 10,
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60',
        fixedServices: [
            { id: 't1', name: 'Math Tutoring Hour', priceRange: 'Rs. 700–1000' },
            { id: 't2', name: 'Science Tutoring Hour', priceRange: 'Rs. 700–1000' }
        ],
        inspectionServices: [
            'Class curriculum advice', 'Test prep analysis'
        ]
    },
    {
        id: 'painting',
        name: 'Painting',
        icon: 'Paintbrush',
        description: 'Eco-friendly interior and exterior wall painting and waterproofing',
        providerCount: 9,
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=60',
        fixedServices: [
            { id: 'pa1', name: 'Single Room Painting', priceRange: 'Rs. 4000–8000' }
        ],
        inspectionServices: [
            'Wall moisture assessment', 'Exterior area mapping'
        ]
    },
    {
        id: 'vehicle-mechanic',
        name: 'Vehicle Mechanic',
        icon: 'Wrench',
        description: 'On-demand scooter/bike and car breakdown and periodic servicing',
        providerCount: 14,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=60',
        fixedServices: [
            { id: 'v1', name: 'Full Bike Servicing', priceRange: 'Rs. 1500–2500' },
            { id: 'v2', name: 'Engine Oil Change', priceRange: 'Rs. 500–800' }
        ],
        inspectionServices: [
            'Strange engine noise diagnosis', 'Electrical system check'
        ]
    },
    {
        id: 'pest-control',
        name: 'Pest Control',
        icon: 'Bug',
        description: 'General disinfection, termite eradication, bed bug treatment',
        providerCount: 11,
        image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=60',
        fixedServices: [
            { id: 'pest1', name: 'Cockroach treatment', priceRange: 'Rs. 1500–2500' },
            { id: 'pest2', name: 'General disinfection', priceRange: 'Rs. 2000–4000' }
        ],
        inspectionServices: [
            'Termite damage assessment', 'Severe bed bug outbreak diagnosis'
        ]
    },
    {
        id: 'beautician',
        name: 'Home Salon & Beauty',
        icon: 'Scissors',
        description: 'Facial, cleanup, waxing, makeup, and hair care at home',
        providerCount: 15,
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60',
        fixedServices: [
            { id: 'b1', name: 'Full Body Waxing', priceRange: 'Rs. 1500–2500' },
            { id: 'b2', name: 'Facial & Clean-up', priceRange: 'Rs. 1000–1800' }
        ],
        inspectionServices: [
            'Bridal makeup consultation'
        ]
    },
    {
        id: 'packers-movers',
        name: 'Packers & Movers',
        icon: 'Truck',
        description: 'Safe room shifting, cargo packing, and commercial relocation',
        providerCount: 12,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=60',
        fixedServices: [
            { id: 'pk1', name: 'Fragile Item Packing', priceRange: 'Rs. 2000–5000' }
        ],
        inspectionServices: [
            'Room shifting volume assessment', 'Office cargo weight estimate'
        ]
    },
    {
        id: 'gardening',
        name: 'Gardening & Landscaping',
        icon: 'Flower2',
        description: 'Lawn mowing, organic soil design, pruning, and garden layout',
        providerCount: 8,
        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=60',
        fixedServices: [
            { id: 'g1', name: 'Lawn Mowing Visit', priceRange: 'Rs. 1000–1500' }
        ],
        inspectionServices: [
            'Landscape planning & soil health diagnosis'
        ]
    },
    {
        id: 'home-nursing',
        name: 'Home Nursing & Care',
        icon: 'HeartPulse',
        description: 'Physiotherapy, clinical elderly support, and post-operative nursing',
        providerCount: 16,
        image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=60',
        fixedServices: [
            { id: 'hn1', name: 'Home Physiotherapy Visit', priceRange: 'Rs. 1000–1500' }
        ],
        inspectionServices: [
            'Bedridden patient clinical care evaluation'
        ]
    },
    {
        id: 'it-support',
        name: 'Computer & IT Support',
        icon: 'Monitor',
        description: 'On-site laptop/desktop repair, Wi-Fi diagnosis, and CCTV setup',
        providerCount: 11,
        image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=60',
        fixedServices: [
            { id: 'it1', name: 'Software Installation', priceRange: 'Rs. 500–1000' },
            { id: 'it2', name: 'Wi-Fi mesh configuration', priceRange: 'Rs. 1000–1500' }
        ],
        inspectionServices: [
            'Custom PC/CCTV hardware setup planning'
        ]
    }
];
