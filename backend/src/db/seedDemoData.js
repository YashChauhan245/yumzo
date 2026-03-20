require('dotenv').config();

const { query, pool } = require('../config/db');

const demoRestaurants = [
  {
    name: 'Delhi Darbar Kitchen',
    description: 'North Indian comfort food with rich gravies and breads.',
    cuisine: 'North Indian',
    address: 'Connaught Place, New Delhi',
    city: 'Delhi',
    phone: '+919811111111',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
    menu: [
      {
        name: 'Butter Chicken',
        description: 'Creamy tomato gravy with tender chicken pieces.',
        price: 349,
        category: 'Main Course',
        isVeg: false,
        image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg',
      },
      {
        name: 'Paneer Lababdar',
        description: 'Soft paneer cubes in a mildly spicy creamy curry.',
        price: 299,
        category: 'Main Course',
        isVeg: true,
        image: 'https://images.pexels.com/photos/12737922/pexels-photo-12737922.jpeg',
      },
      {
        name: 'Garlic Naan',
        description: 'Fresh tandoor naan topped with garlic and butter.',
        price: 89,
        category: 'Breads',
        isVeg: true,
        image: 'https://images.pexels.com/photos/9797029/pexels-photo-9797029.jpeg',
      },
      {
        name: 'Dal Makhani',
        description: 'Slow-cooked black lentils in creamy gravy.',
        price: 239,
        category: 'Main Course',
        isVeg: true,
        image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
      },
      {
        name: 'Jeera Rice',
        description: 'Basmati rice tempered with cumin and ghee.',
        price: 129,
        category: 'Rice',
        isVeg: true,
        image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
      },
      {
        name: 'Chicken Kebab',
        description: 'Smoky chicken kebabs with mint dip.',
        price: 289,
        category: 'Starters',
        isVeg: false,
        image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
      },
    ],
  },
  {
    name: 'Chandni Chowk Chaat House',
    description: 'Street-style chaat and snacks with authentic Delhi flavor.',
    cuisine: 'Street Food',
    address: 'Chandni Chowk, Old Delhi',
    city: 'Delhi',
    phone: '+919822222222',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg',
    menu: [
      {
        name: 'Aloo Tikki Chaat',
        description: 'Crispy aloo tikki topped with chutneys and curd.',
        price: 129,
        category: 'Chaat',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
      },
      {
        name: 'Dahi Bhalla',
        description: 'Soft lentil dumplings with curd and sweet-spicy chutney.',
        price: 139,
        category: 'Chaat',
        isVeg: true,
        image: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg',
      },
      {
        name: 'Papdi Chaat',
        description: 'Crunchy papdi with potatoes, curd and chutneys.',
        price: 119,
        category: 'Chaat',
        isVeg: true,
        image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg',
      },
      {
        name: 'Raj Kachori',
        description: 'Crispy kachori filled with chutneys, curd and sev.',
        price: 149,
        category: 'Chaat',
        isVeg: true,
        image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg',
      },
      {
        name: 'Gol Gappe',
        description: 'Spicy and tangy pani puri with potato filling.',
        price: 99,
        category: 'Chaat',
        isVeg: true,
        image: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg',
      },
      {
        name: 'Samosa Chaat',
        description: 'Crushed samosa topped with curd and chutneys.',
        price: 129,
        category: 'Chaat',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
      },
    ],
  },
  {
    name: 'Rajouri Grill Point',
    description: 'Popular Delhi-style tandoori platters and wraps.',
    cuisine: 'Tandoori',
    address: 'Rajouri Garden, West Delhi',
    city: 'Delhi',
    phone: '+919833333333',
    image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
    menu: [
      {
        name: 'Tandoori Chicken Half',
        description: 'Smoky and juicy tandoori chicken served with onions.',
        price: 329,
        category: 'Starters',
        isVeg: false,
        image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
      },
      {
        name: 'Paneer Tikka',
        description: 'Charred paneer cubes marinated in tandoori masala.',
        price: 279,
        category: 'Starters',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg',
      },
      {
        name: 'Chicken Roll',
        description: 'Roomali wrap loaded with spicy grilled chicken.',
        price: 199,
        category: 'Rolls',
        isVeg: false,
        image: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg',
      },
      {
        name: 'Malai Chicken Tikka',
        description: 'Creamy marinated chicken tikka grilled to perfection.',
        price: 319,
        category: 'Starters',
        isVeg: false,
        image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
      },
      {
        name: 'Veg Seekh Kebab',
        description: 'Spiced mixed veg seekh kebabs with onion salad.',
        price: 229,
        category: 'Starters',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg',
      },
      {
        name: 'Paneer Roll',
        description: 'Soft wrap with smoky paneer and house sauce.',
        price: 179,
        category: 'Rolls',
        isVeg: true,
        image: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg',
      },
    ],
  },
  {
    name: 'South Delhi Bowl Co.',
    description: 'Healthy bowls and quick meals for daily eating.',
    cuisine: 'Healthy Bowls',
    address: 'Saket, South Delhi',
    city: 'Delhi',
    phone: '+919844444444',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    menu: [
      {
        name: 'Paneer Protein Bowl',
        description: 'Rice, paneer, greens and sauce in one bowl.',
        price: 249,
        category: 'Bowls',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
      },
      {
        name: 'Chicken Rice Bowl',
        description: 'Grilled chicken, veggies and herbed rice.',
        price: 289,
        category: 'Bowls',
        isVeg: false,
        image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
      },
      {
        name: 'Greek Salad Bowl',
        description: 'Fresh vegetables, olives and light dressing.',
        price: 199,
        category: 'Salads',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg',
      },
      {
        name: 'Tofu Stir Bowl',
        description: 'Tofu with sauteed veggies and garlic rice.',
        price: 239,
        category: 'Bowls',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      },
      {
        name: 'Egg Burrito Bowl',
        description: 'Mexican style rice bowl with eggs and beans.',
        price: 219,
        category: 'Bowls',
        isVeg: false,
        image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
      },
      {
        name: 'Sprout Salad',
        description: 'Protein rich sprout salad with lemon dressing.',
        price: 189,
        category: 'Salads',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg',
      },
    ],
  },
  {
    name: 'Karol Bagh Biryani Club',
    description: 'Fragrant dum biryanis and spicy side curries.',
    cuisine: 'Biryani',
    address: 'Karol Bagh, Central Delhi',
    city: 'Delhi',
    phone: '+919855555555',
    image: 'https://images.pexels.com/photos/7593231/pexels-photo-7593231.jpeg',
    menu: [
      {
        name: 'Chicken Dum Biryani',
        description: 'Long-grain rice layered with spicy chicken masala.',
        price: 349,
        category: 'Biryani',
        isVeg: false,
        image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg',
      },
      {
        name: 'Mutton Dum Biryani',
        description: 'Classic mutton biryani cooked in sealed pot.',
        price: 429,
        category: 'Biryani',
        isVeg: false,
        image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg',
      },
      {
        name: 'Paneer Biryani',
        description: 'Aromatic paneer biryani with saffron notes.',
        price: 299,
        category: 'Biryani',
        isVeg: true,
        image: 'https://images.pexels.com/photos/12737922/pexels-photo-12737922.jpeg',
      },
      {
        name: 'Veg Raita',
        description: 'Fresh curd with cucumber and spices.',
        price: 79,
        category: 'Sides',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      },
      {
        name: 'Chicken 65',
        description: 'Crispy spicy chicken bites.',
        price: 269,
        category: 'Starters',
        isVeg: false,
        image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
      },
      {
        name: 'Double Ka Meetha',
        description: 'Hyderabadi bread dessert with nuts.',
        price: 129,
        category: 'Dessert',
        isVeg: true,
        image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
      },
    ],
  },
  {
    name: 'Punjabi Tadka Junction',
    description: 'Dhaba-style Punjabi meals with bold flavors.',
    cuisine: 'Punjabi',
    address: 'Tilak Nagar, West Delhi',
    city: 'Delhi',
    phone: '+919866666666',
    image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
    menu: [
      {
        name: 'Chole Bhature',
        description: 'Spicy chickpea curry served with fluffy bhature.',
        price: 189,
        category: 'Main Course',
        isVeg: true,
        image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg',
      },
      {
        name: 'Amritsari Kulcha',
        description: 'Stuffed kulcha with chole and onion salad.',
        price: 169,
        category: 'Breads',
        isVeg: true,
        image: 'https://images.pexels.com/photos/9797029/pexels-photo-9797029.jpeg',
      },
      {
        name: 'Kadai Paneer',
        description: 'Paneer in spicy onion tomato masala.',
        price: 289,
        category: 'Main Course',
        isVeg: true,
        image: 'https://images.pexels.com/photos/12737922/pexels-photo-12737922.jpeg',
      },
      {
        name: 'Dal Fry',
        description: 'Yellow lentils tempered with garlic and cumin.',
        price: 199,
        category: 'Main Course',
        isVeg: true,
        image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
      },
      {
        name: 'Lassi Sweet',
        description: 'Thick sweet Punjabi lassi.',
        price: 99,
        category: 'Beverages',
        isVeg: true,
        image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
      },
      {
        name: 'Gulab Jamun',
        description: 'Warm gulab jamun with syrup.',
        price: 109,
        category: 'Dessert',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
      },
    ],
  },
  {
    name: 'Yamuna Momos Hub',
    description: 'Popular momos, noodles and Tibetan-style bites.',
    cuisine: 'Tibetan',
    address: 'Laxmi Nagar, East Delhi',
    city: 'Delhi',
    phone: '+919877777777',
    image: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg',
    menu: [
      {
        name: 'Steamed Veg Momos',
        description: 'Soft steamed dumplings with spicy chutney.',
        price: 129,
        category: 'Momos',
        isVeg: true,
        image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
      },
      {
        name: 'Chicken Momos',
        description: 'Juicy chicken momos served hot.',
        price: 149,
        category: 'Momos',
        isVeg: false,
        image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
      },
      {
        name: 'Fried Veg Momos',
        description: 'Crispy fried momos with dip.',
        price: 139,
        category: 'Momos',
        isVeg: true,
        image: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg',
      },
      {
        name: 'Hakka Noodles',
        description: 'Street-style veg hakka noodles.',
        price: 179,
        category: 'Noodles',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      },
      {
        name: 'Chilli Chicken',
        description: 'Spicy chilli chicken with bell peppers.',
        price: 239,
        category: 'Starters',
        isVeg: false,
        image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg',
      },
      {
        name: 'Thukpa Soup',
        description: 'Comforting noodle soup with vegetables.',
        price: 189,
        category: 'Soup',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg',
      },
    ],
  },
  {
    name: 'Saket Pizza Studio',
    description: 'Wood-fired pizzas and cheesy sides.',
    cuisine: 'Italian',
    address: 'Saket, South Delhi',
    city: 'Delhi',
    phone: '+919888888888',
    image: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg',
    menu: [
      {
        name: 'Margherita Pizza',
        description: 'Classic tomato, basil and mozzarella pizza.',
        price: 299,
        category: 'Pizza',
        isVeg: true,
        image: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg',
      },
      {
        name: 'Farmhouse Pizza',
        description: 'Loaded veggie pizza with extra cheese.',
        price: 369,
        category: 'Pizza',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
      },
      {
        name: 'Chicken Pepperoni Pizza',
        description: 'Pepperoni slices on smoky tomato base.',
        price: 429,
        category: 'Pizza',
        isVeg: false,
        image: 'https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg',
      },
      {
        name: 'Garlic Bread',
        description: 'Toasted garlic bread with dip.',
        price: 149,
        category: 'Sides',
        isVeg: true,
        image: 'https://images.pexels.com/photos/9797029/pexels-photo-9797029.jpeg',
      },
      {
        name: 'White Sauce Pasta',
        description: 'Creamy pasta with veggies.',
        price: 259,
        category: 'Pasta',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg',
      },
      {
        name: 'Choco Lava Cake',
        description: 'Warm chocolate lava dessert.',
        price: 129,
        category: 'Dessert',
        isVeg: true,
        image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
      },
    ],
  },
  {
    name: 'Connaught Burger Lab',
    description: 'Loaded burgers, fries and shakes.',
    cuisine: 'Fast Food',
    address: 'Connaught Place, New Delhi',
    city: 'Delhi',
    phone: '+919899999999',
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
    menu: [
      {
        name: 'Classic Veg Burger',
        description: 'Crispy veg patty burger with sauces.',
        price: 149,
        category: 'Burger',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
      },
      {
        name: 'Chicken Cheese Burger',
        description: 'Juicy chicken burger with melted cheese.',
        price: 199,
        category: 'Burger',
        isVeg: false,
        image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
      },
      {
        name: 'Peri Peri Fries',
        description: 'Crispy fries tossed in peri peri masala.',
        price: 119,
        category: 'Sides',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg',
      },
      {
        name: 'Crispy Chicken Wings',
        description: 'Spicy crispy chicken wings.',
        price: 249,
        category: 'Starters',
        isVeg: false,
        image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
      },
      {
        name: 'Cold Coffee',
        description: 'Chilled cold coffee with ice cream.',
        price: 139,
        category: 'Beverages',
        isVeg: true,
        image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
      },
      {
        name: 'Brownie Sundae',
        description: 'Chocolate brownie topped with vanilla ice cream.',
        price: 159,
        category: 'Dessert',
        isVeg: true,
        image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
      },
    ],
  },
  {
    name: 'Dwarka Dosa Factory',
    description: 'South Indian dosas, idli and filter coffee.',
    cuisine: 'South Indian',
    address: 'Dwarka Sector 10, Delhi',
    city: 'Delhi',
    phone: '+919800000000',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg',
    menu: [
      {
        name: 'Masala Dosa',
        description: 'Crispy dosa with potato masala filling.',
        price: 149,
        category: 'Dosa',
        isVeg: true,
        image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg',
      },
      {
        name: 'Rava Dosa',
        description: 'Thin and crispy semolina dosa.',
        price: 169,
        category: 'Dosa',
        isVeg: true,
        image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg',
      },
      {
        name: 'Idli Sambar',
        description: 'Soft idlis served with hot sambar.',
        price: 109,
        category: 'Breakfast',
        isVeg: true,
        image: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg',
      },
      {
        name: 'Medu Vada',
        description: 'Crispy medu vada with coconut chutney.',
        price: 119,
        category: 'Breakfast',
        isVeg: true,
        image: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg',
      },
      {
        name: 'Paneer Uttapam',
        description: 'Soft uttapam loaded with paneer topping.',
        price: 189,
        category: 'Uttapam',
        isVeg: true,
        image: 'https://images.pexels.com/photos/12737922/pexels-photo-12737922.jpeg',
      },
      {
        name: 'Filter Coffee',
        description: 'Traditional South Indian filter coffee.',
        price: 89,
        category: 'Beverages',
        isVeg: true,
        image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
      },
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

      // Refresh menu for each demo restaurant to keep seed output clean.
      await query('DELETE FROM menu_items WHERE restaurant_id = $1', [restaurantId]);

      for (const menuItem of item.menu) {
        await query(
          `INSERT INTO menu_items
           (restaurant_id, name, description, price, category, image_url, is_veg, is_available)
           VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
          [
            restaurantId,
            menuItem.name,
            menuItem.description,
            menuItem.price,
            menuItem.category,
            menuItem.image,
            menuItem.isVeg,
          ],
        );
      }
    }

    console.log('Demo data seeded successfully.');
    console.log(`Restaurants seeded: ${demoRestaurants.length} (Delhi only)`);
  } catch (error) {
    console.error('Failed to seed demo data:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
