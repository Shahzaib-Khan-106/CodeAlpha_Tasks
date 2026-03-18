import jwt from 'jsonwebtoken';

const JWT_SECRET = "yourSecretKey"; // use process.env.JWT_SECRET in production

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // ✅ attach as an object
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
