require('dotenv').config();

const { query, pool } = require('../config/db');

const demoRestaurants = [
  {
    name: 'Delhi Darbar Kitchen',
    description: 'Authentic North Indian comfort food — rich gravies, fresh tandoori breads, and homestyle curries since 1998.',
    cuisine: 'North Indian',
    address: 'Connaught Place, New Delhi',
    city: 'Delhi',
    phone: '+919811111111',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
    menu: [
      // 4 Veg
      { name: 'Paneer Butter Masala', description: 'Cottage cheese cubes in rich tomato-butter gravy with kasuri methi.', price: 299, category: 'Main Course', isVeg: true, image: 'https://images.pexels.com/photos/12737922/pexels-photo-12737922.jpeg' },
      { name: 'Dal Makhani', description: 'Slow-cooked black lentils simmered overnight in cream and butter.', price: 249, category: 'Main Course', isVeg: true, image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg' },
      { name: 'Garlic Naan', description: 'Soft tandoor-baked naan brushed with garlic butter and fresh coriander.', price: 89, category: 'Breads', isVeg: true, image: 'https://images.pexels.com/photos/9797029/pexels-photo-9797029.jpeg' },
      { name: 'Veg Biryani', description: 'Fragrant basmati rice layered with seasonal vegetables and aromatic spices.', price: 269, category: 'Rice', isVeg: true, image: 'https://images.pexels.com/photos/7593231/pexels-photo-7593231.jpeg' },
      // 4 Non-Veg
      { name: 'Butter Chicken', description: 'Tender chicken pieces in creamy tomato gravy — our signature dish.', price: 349, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg' },
      { name: 'Chicken Biryani', description: 'Hyderabadi-style dum biryani with juicy chicken and saffron rice.', price: 349, category: 'Rice', isVeg: false, image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg' },
      { name: 'Mutton Rogan Josh', description: 'Kashmiri-style slow-cooked mutton in aromatic red chilli gravy.', price: 449, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg' },
      { name: 'Tandoori Chicken', description: 'Half chicken marinated in yogurt spices and charred in tandoor.', price: 329, category: 'Starters', isVeg: false, image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg' },
    ],
  },
  {
    name: 'Pizza Paradiso',
    description: 'Wood-fired Neapolitan pizzas, handmade pastas, and classic Italian desserts from our Italian chef.',
    cuisine: 'Italian',
    address: 'MG Road, Bangalore',
    city: 'Bangalore',
    phone: '+919822222222',
    image: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg',
    menu: [
      // 4 Veg
      { name: 'Margherita Pizza', description: 'San Marzano tomatoes, fresh mozzarella, basil on wood-fired dough.', price: 349, category: 'Pizza', isVeg: true, image: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg' },
      { name: 'Penne Arrabbiata', description: 'Al dente penne in spicy tomato sauce with garlic and chilli flakes.', price: 289, category: 'Pasta', isVeg: true, image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg' },
      { name: 'Bruschetta', description: 'Toasted ciabatta topped with diced tomatoes, basil and olive oil.', price: 199, category: 'Starters', isVeg: true, image: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg' },
      { name: 'Tiramisu', description: 'Classic Italian dessert — layers of espresso-soaked ladyfingers and mascarpone.', price: 249, category: 'Dessert', isVeg: true, image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg' },
      // 4 Non-Veg
      { name: 'Pepperoni Pizza', description: 'Loaded with spicy chicken pepperoni slices and mozzarella cheese.', price: 429, category: 'Pizza', isVeg: false, image: 'https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg' },
      { name: 'Chicken Alfredo Pasta', description: 'Fettuccine in creamy white sauce with grilled chicken strips.', price: 349, category: 'Pasta', isVeg: false, image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg' },
      { name: 'Meat Lovers Pizza', description: 'BBQ chicken, sausage, and bacon on our signature tomato base.', price: 499, category: 'Pizza', isVeg: false, image: 'https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg' },
      { name: 'Chicken Caesar Salad', description: 'Romaine, grilled chicken, parmesan, croutons, Caesar dressing.', price: 279, category: 'Salads', isVeg: false, image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg' },
    ],
  },
  {
    name: 'Sushi Samurai',
    description: 'Premium sushi, fresh sashimi, authentic ramen bowls — Japanese cuisine crafted with precision.',
    cuisine: 'Japanese',
    address: 'Khan Market, New Delhi',
    city: 'Delhi',
    phone: '+919833333333',
    image: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg',
    menu: [
      // 4 Veg
      { name: 'Avocado Maki Roll', description: 'Fresh avocado rolled in seasoned sushi rice and nori seaweed.', price: 299, category: 'Sushi', isVeg: true, image: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg' },
      { name: 'Vegetable Tempura', description: 'Crispy battered sweet potato, broccoli, and bell peppers with dipping sauce.', price: 279, category: 'Starters', isVeg: true, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' },
      { name: 'Miso Soup', description: 'Traditional Japanese soup with tofu, wakame seaweed, and green onions.', price: 179, category: 'Soup', isVeg: true, image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg' },
      { name: 'Matcha Ice Cream', description: 'Authentic Japanese green tea ice cream — smooth and earthy.', price: 199, category: 'Dessert', isVeg: true, image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg' },
      // 4 Non-Veg
      { name: 'Salmon Nigiri', description: 'Fresh Norwegian salmon slices on pressed vinegared rice.', price: 449, category: 'Sushi', isVeg: false, image: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg' },
      { name: 'Dragon Roll', description: 'Shrimp tempura, avocado, eel sauce — our bestseller sushi roll.', price: 529, category: 'Sushi', isVeg: false, image: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg' },
      { name: 'Tonkotsu Ramen', description: 'Rich pork bone broth, chashu pork belly, soft egg, noodles.', price: 449, category: 'Ramen', isVeg: false, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' },
      { name: 'Chicken Katsu', description: 'Crispy breaded chicken cutlet with tonkatsu sauce and cabbage.', price: 349, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg' },
    ],
  },
  {
    name: 'Burger Republic',
    description: 'Handcrafted smash burgers, loaded fries, crispy wings, and thick shakes — American comfort food.',
    cuisine: 'American',
    address: 'FC Road, Pune',
    city: 'Pune',
    phone: '+919844444444',
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
    menu: [
      // 4 Veg
      { name: 'Classic Veggie Burger', description: 'Crispy chickpea patty with lettuce, tomato, pickles, and special sauce.', price: 199, category: 'Burgers', isVeg: true, image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg' },
      { name: 'Loaded Cheese Fries', description: 'Crispy fries smothered in cheddar cheese, jalapeños, and sour cream.', price: 179, category: 'Sides', isVeg: true, image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg' },
      { name: 'Onion Rings', description: 'Beer-battered thick-cut onion rings with chipotle mayo dip.', price: 149, category: 'Sides', isVeg: true, image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg' },
      { name: 'Oreo Milkshake', description: 'Thick creamy shake blended with Oreo cookies and vanilla ice cream.', price: 189, category: 'Beverages', isVeg: true, image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg' },
      // 4 Non-Veg
      { name: 'Double Smash Burger', description: 'Two beef-style chicken patties, American cheese, caramelized onions.', price: 349, category: 'Burgers', isVeg: false, image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg' },
      { name: 'BBQ Chicken Wings', description: 'Crispy wings tossed in smoky BBQ sauce with ranch dip.', price: 289, category: 'Starters', isVeg: false, image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg' },
      { name: 'Chicken Wrap', description: 'Grilled chicken, coleslaw, cheddar, and garlic aioli in a tortilla.', price: 249, category: 'Wraps', isVeg: false, image: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg' },
      { name: 'Fish & Chips', description: 'Beer-battered crispy fish fillet with fries and tartar sauce.', price: 329, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg' },
    ],
  },
  {
    name: 'Green Bowl Co.',
    description: 'Nutritious Buddha bowls, fresh smoothies, and protein-packed meals for the health-conscious.',
    cuisine: 'Healthy',
    address: 'Bandra West, Mumbai',
    city: 'Mumbai',
    phone: '+919855555555',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    menu: [
      // 4 Veg
      { name: 'Quinoa Buddha Bowl', description: 'Quinoa, roasted chickpeas, avocado, cherry tomatoes, tahini drizzle.', price: 349, category: 'Bowls', isVeg: true, image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg' },
      { name: 'Acai Smoothie Bowl', description: 'Blended acai, banana, granola, mixed berries, chia seeds, honey.', price: 299, category: 'Bowls', isVeg: true, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' },
      { name: 'Avocado Toast', description: 'Sourdough toast with smashed avocado, cherry tomatoes, microgreens.', price: 249, category: 'Breakfast', isVeg: true, image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg' },
      { name: 'Green Detox Smoothie', description: 'Spinach, kale, green apple, ginger, lemon — energy in a glass.', price: 199, category: 'Beverages', isVeg: true, image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg' },
      // 4 Non-Veg
      { name: 'Grilled Chicken Salad', description: 'Mixed greens, grilled chicken breast, feta, walnuts, balsamic vinaigrette.', price: 349, category: 'Salads', isVeg: false, image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg' },
      { name: 'Salmon Poke Bowl', description: 'Fresh salmon cubes, edamame, cucumber, sesame rice, ponzu sauce.', price: 499, category: 'Bowls', isVeg: false, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' },
      { name: 'Chicken Protein Bowl', description: 'Brown rice, grilled chicken, roasted veggies, hummus, mixed seeds.', price: 379, category: 'Bowls', isVeg: false, image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg' },
      { name: 'Egg White Omelette', description: 'Fluffy egg whites with spinach, mushroom, bell peppers, feta cheese.', price: 229, category: 'Breakfast', isVeg: false, image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg' },
    ],
  },
  {
    name: 'Dragon Wok',
    description: 'Fiery Indo-Chinese — hakka noodles, Manchurian, crispy starters, and sizzlers that hit different.',
    cuisine: 'Chinese',
    address: 'HITEC City, Hyderabad',
    city: 'Hyderabad',
    phone: '+919866666666',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    menu: [
      // 4 Veg
      { name: 'Veg Manchurian', description: 'Crispy veggie balls tossed in spicy manchurian gravy with spring onions.', price: 229, category: 'Starters', isVeg: true, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' },
      { name: 'Hakka Noodles', description: 'Stir-fried noodles with crunchy vegetables and soy sauce.', price: 219, category: 'Noodles', isVeg: true, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' },
      { name: 'Paneer Chilli Dry', description: 'Crispy paneer cubes tossed with peppers, onions, and chilli sauce.', price: 269, category: 'Starters', isVeg: true, image: 'https://images.pexels.com/photos/12737922/pexels-photo-12737922.jpeg' },
      { name: 'Veg Spring Rolls', description: 'Crispy golden rolls filled with cabbage, carrots, and glass noodles.', price: 179, category: 'Starters', isVeg: true, image: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg' },
      // 4 Non-Veg
      { name: 'Chicken Manchurian', description: 'Juicy chicken balls in hot manchurian gravy — street-style.', price: 289, category: 'Starters', isVeg: false, image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg' },
      { name: 'Chilli Chicken', description: 'Spicy battered chicken with bell peppers, onions, and green chillies.', price: 299, category: 'Starters', isVeg: false, image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg' },
      { name: 'Chicken Fried Rice', description: 'Wok-tossed rice with chicken, egg, vegetables, and soy sauce.', price: 259, category: 'Rice', isVeg: false, image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg' },
      { name: 'Dragon Chicken', description: 'Our signature fiery chicken in a sweet-spicy dragon sauce.', price: 329, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg' },
    ],
  },
  {
    name: 'Dosa Junction',
    description: 'Crispy dosas, fluffy idlis, authentic filter coffee — South Indian breakfast done right since 2005.',
    cuisine: 'South Indian',
    address: 'T. Nagar, Chennai',
    city: 'Chennai',
    phone: '+919877777777',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg',
    menu: [
      // 4 Veg
      { name: 'Masala Dosa', description: 'Paper-thin crispy dosa stuffed with spiced potato masala and served with chutneys.', price: 149, category: 'Dosa', isVeg: true, image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg' },
      { name: 'Idli Sambar', description: 'Soft steamed rice cakes served with piping hot sambar and coconut chutney.', price: 109, category: 'Breakfast', isVeg: true, image: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg' },
      { name: 'Medu Vada', description: 'Crispy golden lentil fritters with coconut chutney and sambar.', price: 119, category: 'Breakfast', isVeg: true, image: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg' },
      { name: 'Filter Coffee', description: 'Strong decoction brewed in traditional brass filter, served frothy.', price: 79, category: 'Beverages', isVeg: true, image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg' },
      // 4 Non-Veg
      { name: 'Chicken Chettinad', description: 'Fiery Chettinad chicken curry with freshly ground black pepper masala.', price: 329, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg' },
      { name: 'Egg Dosa', description: 'Crispy dosa with a layer of spiced egg omelette cooked right on it.', price: 169, category: 'Dosa', isVeg: false, image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg' },
      { name: 'Mutton Kuzhambu', description: 'Traditional Tamil-style mutton curry in tamarind-spice gravy.', price: 399, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg' },
      { name: 'Prawn Pepper Fry', description: 'Juicy prawns tossed with curry leaves, black pepper, and onions.', price: 369, category: 'Starters', isVeg: false, image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg' },
    ],
  },
  {
    name: 'Taco Fiesta',
    description: 'Loaded tacos, cheesy quesadillas, fresh guacamole, and fiery salsas — Mexico on your plate.',
    cuisine: 'Mexican',
    address: 'Calangute, Goa',
    city: 'Goa',
    phone: '+919888888888',
    image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
    menu: [
      // 4 Veg
      { name: 'Bean & Cheese Burrito', description: 'Flour tortilla stuffed with refried beans, cheddar, salsa, and sour cream.', price: 249, category: 'Burritos', isVeg: true, image: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg' },
      { name: 'Loaded Nachos', description: 'Crispy tortilla chips with melted cheese, jalapeños, guacamole, salsa.', price: 229, category: 'Starters', isVeg: true, image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg' },
      { name: 'Churros', description: 'Cinnamon-sugar coated fried dough sticks with warm chocolate dipping sauce.', price: 179, category: 'Dessert', isVeg: true, image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg' },
      { name: 'Mexican Corn', description: 'Grilled street corn with mayo, chilli powder, lime, and cotija cheese.', price: 149, category: 'Sides', isVeg: true, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' },
      // 4 Non-Veg
      { name: 'Chicken Tacos', description: 'Soft corn tortillas with spiced pulled chicken, pico de gallo, cilantro.', price: 299, category: 'Tacos', isVeg: false, image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg' },
      { name: 'Chicken Quesadilla', description: 'Grilled flour tortilla with seasoned chicken, peppers, melted cheese.', price: 279, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg' },
      { name: 'Beef-Style Burrito Bowl', description: 'Rice bowl with spiced chicken keema, black beans, corn, avocado, salsa.', price: 349, category: 'Bowls', isVeg: false, image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg' },
      { name: 'Prawn Fajitas', description: 'Sizzling prawns with peppers, onions, served with warm tortillas.', price: 399, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg' },
    ],
  },
  {
    name: 'Beirut Bites',
    description: 'Authentic falafel wraps, creamy hummus, grilled shawarma, and warm pita — taste of the Mediterranean.',
    cuisine: 'Mediterranean',
    address: 'Indiranagar, Bangalore',
    city: 'Bangalore',
    phone: '+919899999999',
    image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
    menu: [
      // 4 Veg
      { name: 'Falafel Wrap', description: 'Crispy chickpea falafel with tahini, pickled turnip, and fresh veggies.', price: 249, category: 'Wraps', isVeg: true, image: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg' },
      { name: 'Hummus with Pita', description: 'Creamy chickpea hummus drizzled with olive oil, served with warm pita.', price: 199, category: 'Starters', isVeg: true, image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg' },
      { name: 'Baklava', description: 'Flaky phyllo pastry layers with pistachios and honey syrup.', price: 179, category: 'Dessert', isVeg: true, image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg' },
      { name: 'Tabbouleh Salad', description: 'Fresh parsley, bulgur wheat, tomatoes, mint, lemon-olive oil dressing.', price: 219, category: 'Salads', isVeg: true, image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg' },
      // 4 Non-Veg
      { name: 'Chicken Shawarma Plate', description: 'Slow-roasted chicken shawarma with garlic sauce, pickles, and pita.', price: 329, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg' },
      { name: 'Lamb Kofta Kebab', description: 'Spiced minced lamb kebabs grilled on charcoal, served with tzatziki.', price: 399, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg' },
      { name: 'Chicken Shish Tawook', description: 'Marinated chicken skewers grilled to perfection with garlic dip.', price: 349, category: 'Main Course', isVeg: false, image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg' },
      { name: 'Meat Shawarma Wrap', description: 'Juicy lamb and chicken mix in saj bread with tahini and veggies.', price: 299, category: 'Wraps', isVeg: false, image: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg' },
    ],
  },
];

const run = async () => {
  try {
    const ownerEmail = 'demo-owner@yumzo.local';

    const ownerResult = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['Demo Owner', ownerEmail, 'demo_password_hash_not_for_login', 'restaurant_owner'],
    );

    const ownerId = ownerResult.rows[0].id;

    // Clear old demo restaurants before re-seeding
    for (const item of demoRestaurants) {
      const existing = await query(
        'SELECT id FROM restaurants WHERE name = $1 AND city = $2 LIMIT 1',
        [item.name, item.city],
      );

      let restaurantId;

      if (existing.rows[0]) {
        restaurantId = existing.rows[0].id;
        await query(
          `UPDATE restaurants
           SET owner_id = $1, description = $2, cuisine_type = $3, address = $4, phone = $5, image_url = $6, is_active = TRUE
           WHERE id = $7`,
          [ownerId, item.description, item.cuisine, item.address, item.phone, item.image, restaurantId],
        );
      } else {
        const inserted = await query(
          `INSERT INTO restaurants (owner_id, name, description, cuisine_type, address, city, phone, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [ownerId, item.name, item.description, item.cuisine, item.address, item.city, item.phone, item.image],
        );
        restaurantId = inserted.rows[0].id;
      }

      // Refresh menu
      await query('DELETE FROM menu_items WHERE restaurant_id = $1', [restaurantId]);

      for (const menuItem of item.menu) {
        await query(
          `INSERT INTO menu_items
           (restaurant_id, name, description, price, category, image_url, is_veg, is_available)
           VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
          [restaurantId, menuItem.name, menuItem.description, menuItem.price, menuItem.category, menuItem.image, menuItem.isVeg],
        );
      }
    }

    console.log('✅ Demo data seeded successfully.');
    console.log(`   Restaurants: ${demoRestaurants.length}`);
    console.log(`   Dishes per restaurant: 8 (4 veg + 4 non-veg)`);
    console.log(`   Total dishes: ${demoRestaurants.length * 8}`);
  } catch (error) {
    console.error('Failed to seed demo data:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
