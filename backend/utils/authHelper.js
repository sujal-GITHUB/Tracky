const jwt = require('jsonwebtoken');
const config = require('./config');

/**
 * Generate a JWT token for testing purposes
 * In production, this would be handled by a proper authentication service
 */

// Mock seller data for testing
const mockSellers = [
  {
    sellerId: 'seller_123',
    sellerName: 'Tech Gadgets Store',
    email: 'seller@techgadgets.com'
  },
  {
    sellerId: 'seller_456',
    sellerName: 'Fashion Hub',
    email: 'seller@fashionhub.com'
  },
  {
    sellerId: 'seller_789',
    sellerName: 'Home Decor Plus',
    email: 'seller@homedecor.com'
  }
];

// Generate token for a seller
const generateToken = (sellerId) => {
  const seller = mockSellers.find(s => s.sellerId === sellerId);
  if (!seller) {
    throw new Error('Seller not found');
  }

  const payload = {
    sellerId: seller.sellerId,
    sellerName: seller.sellerName,
    email: seller.email,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpire });
};

// Verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Generate tokens for all mock sellers
const generateAllTokens = () => {
  const tokens = {};
  mockSellers.forEach(seller => {
    tokens[seller.sellerId] = generateToken(seller.sellerId);
  });
  return tokens;
};

// CLI tool to generate tokens
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔑 Tracky JWT Token Generator\n');
    console.log('Available sellers:');
    mockSellers.forEach(seller => {
      console.log(`- ${seller.sellerId}: ${seller.sellerName}`);
    });
    console.log('\nUsage:');
    console.log('node authHelper.js <sellerId>  # Generate token for specific seller');
    console.log('node authHelper.js all         # Generate tokens for all sellers');
  } else if (args[0] === 'all') {
    console.log('🔑 Generating tokens for all sellers:\n');
    const tokens = generateAllTokens();
    Object.entries(tokens).forEach(([sellerId, token]) => {
      const seller = mockSellers.find(s => s.sellerId === sellerId);
      console.log(`${seller.sellerName} (${sellerId}):`);
      console.log(`Token: ${token}\n`);
    });
  } else {
    const sellerId = args[0];
    try {
      const token = generateToken(sellerId);
      const seller = mockSellers.find(s => s.sellerId === sellerId);
      console.log(`🔑 Token for ${seller.sellerName} (${sellerId}):`);
      console.log(token);
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log('\nAvailable sellers:');
      mockSellers.forEach(seller => {
        console.log(`- ${seller.sellerId}: ${seller.sellerName}`);
      });
    }
  }
}

module.exports = {
  generateToken,
  verifyToken,
  generateAllTokens,
  mockSellers
};
