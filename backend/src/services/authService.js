const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const boom = require("@hapi/boom");
const prisma = new PrismaClient();

const registerUser = async (name, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.client.create({
      data: { name, email, password: hashedPassword, role: "USER" },
    });
    return newUser;
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      throw boom.badRequest("EMAIL ALREADY EXISTS");
    }
    throw error;
  }
};
const loginUser = async (email, password) => {
  const user = await prisma.client.findUnique({
    where: { email },
  });
  if (!user) {
    throw boom.badRequest("INVALID EMAIL OR PASSWORD");
  }
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    throw boom.badRequest("INVALID EMAIL OR PASSWORD");
  }
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "4h" },
  );
  return token;
};
const editClient = async (name, email, password) => {
  await prisma.$transaction(async (tx) => {
    const client = await tx.client.findUnique({
      where: {
        email: email,
      },
      select: {
        password: true,
      },
    });
    const validPass = await bcrypt.compare(password, client.password);
    if (!validPass) {
      throw boom.badRequest("INVALID EMAIL OR PASSWORD");
    }
    const update = await tx.client.update({
      where: {
        email: email,
      },
      data: {
        name: name,
      },
    });
  });
};
module.exports = { registerUser, loginUser, editClient };
