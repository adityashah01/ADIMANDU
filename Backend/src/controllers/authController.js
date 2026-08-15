const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const SALT_ROUNDS = 10;

// Cookie configuration
const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function signToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
}

// =======================
// SIGNUP
// =======================

async function signup(req, res) {
    try {
        let { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email and password are required.",
            });
        }

        name = name.trim();
        email = email.trim().toLowerCase();

        role = role ? role.toUpperCase() : "CUSTOMER";

        if (!["CUSTOMER", "PROVIDER"].includes(role)) {
            return res.status(400).json({
                error: "Invalid role.",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return res.status(409).json({
                error: "User already exists.",
            });
        }

        const passwordHash = await bcrypt.hash(
            password,
            SALT_ROUNDS
        );

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role,
            },
        });

        const token = signToken(user);

        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(201).json({
            message: "Signup successful.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("❌ Signup Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
            message:
                process.env.NODE_ENV === "production"
                    ? "Something went wrong during signup."
                    : error.message,
        });
    }
}

// =======================
// LOGIN
// =======================

async function login(req, res) {
    try {
        const { email, password } = req.body;
        console.log(`[AUTH] Login attempt for: ${email}`);

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (!user) {
            console.log(`[AUTH] User not found: ${normalizedEmail}`);
            return res.status(401).json({
                error: "Invalid email or password.",
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!validPassword) {
            console.log(`[AUTH] Password mismatch for: ${normalizedEmail}`);
            return res.status(401).json({
                error: "Invalid email or password.",
            });
        }

        if (user.status !== "ACTIVE") {
            console.log(`[AUTH] Account suspended for: ${normalizedEmail}`);
            return res.status(403).json({
                error: "Your account has been suspended.",
            });
        }

        const token = signToken(user);

        res.cookie("token", token, COOKIE_OPTIONS);
        console.log(`[AUTH] Login successful for: ${normalizedEmail}`);

        return res.status(200).json({
            message: "Login successful.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("❌ Login Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
            message:
                process.env.NODE_ENV === "production"
                    ? "Something went wrong during login."
                    : error.message,
        });
    }
}

// =======================
// CURRENT USER
// =======================

async function me(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id,
            },

            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatarUrl: true,
                status: true,
                createdAt: true,

                providerProfile: {
                    select: {
                        id: true,
                        categoryId: true,
                        totalEarnings: true,
                        averageRating: true,
                        reviewCount: true,

                        category: {
                            select: {
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found.",
            });
        }

        return res.status(200).json({
            user,
        });
    } catch (error) {
        console.error("❌ Me Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}

// =======================
// LOGOUT
// =======================

function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
    });

    return res.status(200).json({
        message: "Logged out successfully.",
    });
}

// =======================
// UPDATE PROFILE
// =======================

async function updateProfile(req, res) {
    try {
        const { name, phone, avatarUrl } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                error: "Name is required.",
            });
        }

        const data = {
            name: name.trim(),
            phone: phone?.trim() || null,
        };

        // Only update avatarUrl if explicitly provided
        if (typeof avatarUrl === "string") {
            data.avatarUrl = avatarUrl || null;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: req.user.id,
            },

            data,

            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatarUrl: true,
                status: true,
                createdAt: true,
            },
        });

        return res.status(200).json({
            user: updatedUser,
        });
    } catch (error) {
        console.error("❌ Update Profile Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}

module.exports = {
    signup,
    login,
    me,
    logout,
    updateProfile,
};