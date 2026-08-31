const jwt = require('jsonwebtoken');
const { User, StudentProfile } = require('../models');

// Helper to sign JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'dsp_jwt_secret_dev_key_2026_super_secure',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user (Student or Recruiter)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student', college, company, companyWebsite } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters in length.',
      });
    }

    // Role validation: public register can only be student or recruiter
    const userRole = role.toLowerCase();
    if (!['student', 'recruiter'].includes(userRole)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Choose either student or recruiter.',
      });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'An account with this email address already exists.',
      });
    }

    const isRecruiter = userRole === 'recruiter';

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      college: college || '',
      company: company || college || '',
      companyWebsite: companyWebsite || '',
      recruiterStatus: isRecruiter ? 'PENDING' : 'APPROVED',
      isVerifiedRecruiter: !isRecruiter,
    });

    let profile = null;
    // If student, automatically initialize student profile with a unique passport ID
    if (userRole === 'student') {
      let uniquePassportId = StudentProfile.generatePassportId(name);
      // Ensure passportId uniqueness
      while (await StudentProfile.findOne({ passportId: uniquePassportId })) {
        uniquePassportId = StudentProfile.generatePassportId(name);
      }

      profile = await StudentProfile.create({
        userId: user._id,
        passportId: uniquePassportId,
        location: '',
        degree: '',
        department: '',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      status: 'success',
      message: isRecruiter
        ? 'Recruiter account registered! Pending administrative review.'
        : 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        company: user.company,
        companyWebsite: user.companyWebsite,
        recruiterStatus: user.recruiterStatus,
        isVerifiedRecruiter: user.isVerifiedRecruiter,
        profilePhoto: user.profilePhoto,
        passportId: profile ? profile.passportId : null,
      },
    });
  } catch (error) {
    console.error('[Auth Controller - Register]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error during registration',
    });
  }
};

// @desc    Authenticate user & return JWT
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      });
    }

    // Find user with password field explicitly selected
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password credentials',
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password credentials',
      });
    }

    let passportId = null;
    if (user.role === 'student') {
      let profile = await StudentProfile.findOne({ userId: user._id });
      if (!profile) {
        // Fallback create profile if missing
        passportId = StudentProfile.generatePassportId(user.name);
        profile = await StudentProfile.create({
          userId: user._id,
          passportId,
        });
      } else {
        passportId = profile.passportId;
      }
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        company: user.company || user.college || '',
        companyWebsite: user.companyWebsite || '',
        recruiterStatus: user.recruiterStatus || (user.role === 'recruiter' ? 'APPROVED' : 'APPROVED'),
        isVerifiedRecruiter: user.isVerifiedRecruiter ?? true,
        profilePhoto: user.profilePhoto,
        passportId,
      },
    });
  } catch (error) {
    console.error('[Auth Controller - Login]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error during login',
    });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User account not found',
      });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        company: user.company || user.college || '',
        companyWebsite: user.companyWebsite || '',
        recruiterStatus: user.recruiterStatus || (user.role === 'recruiter' ? 'APPROVED' : 'APPROVED'),
        isVerifiedRecruiter: user.isVerifiedRecruiter ?? true,
        profilePhoto: user.profilePhoto,
        passportId: profile ? profile.passportId : null,
      },
    });
  } catch (error) {
    console.error('[Auth Controller - GetMe]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve current user',
    });
  }
};

// @desc    Forgot Password Request - generate verification reset code
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please enter your registered email address.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No registered account found with that email address.',
      });
    }

    // Generate a secure 6-digit verification reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `Verification reset code generated for ${user.email}.`,
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
        resetCode: resetCode,
      },
    });
  } catch (error) {
    console.error('[Auth Controller - ForgotPassword]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error processing forgot password request',
    });
  }
};

// @desc    Reset Password using verification code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user account found with this email address.',
      });
    }

    // Verify resetCode if user has one pending
    if (user.resetPasswordToken) {
      if (!resetCode || user.resetPasswordToken !== resetCode.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid verification reset code. Please check and try again.',
        });
      }
      if (user.resetPasswordExpire && user.resetPasswordExpire < new Date()) {
        return res.status(400).json({
          status: 'error',
          message: 'Verification reset code has expired. Please request a new code.',
        });
      }
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('[Auth Controller - ResetPassword]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error resetting password',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};
