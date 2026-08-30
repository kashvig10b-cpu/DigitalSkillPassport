const { Project, StudentProfile } = require('../models');

// @desc    Get all projects for authenticated student
// @route   GET /api/projects
// @access  Private (Student)
const getProjects = async (req, res) => {
  try {
    const studentId = req.user._id;
    const projects = await Project.find({ studentId }).sort({ startDate: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error('[Project Controller - GetProjects]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch projects',
    });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Student)
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      githubUrl,
      liveUrl,
      image,
      startDate,
      endDate,
      role,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Project title and description are required',
      });
    }

    // Format technologies array
    let techArray = [];
    if (Array.isArray(technologies)) {
      techArray = technologies;
    } else if (typeof technologies === 'string') {
      techArray = technologies.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const project = await Project.create({
      studentId: req.user._id,
      title: title.trim(),
      description: description.trim(),
      technologies: techArray,
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      image: image || '',
      startDate: startDate || null,
      endDate: endDate || null,
      role: role || '',
    });

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('projectAdded', project);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('projectAdded', project);
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    console.error('[Project Controller - CreateProject]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create project',
    });
  }
};

// @desc    Update an existing project
// @route   PUT /api/projects/:id
// @access  Private (Student)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      technologies,
      githubUrl,
      liveUrl,
      image,
      startDate,
      endDate,
      role,
    } = req.body;

    const project = await Project.findOne({ _id: id, studentId: req.user._id });
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found or unauthorized',
      });
    }

    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (technologies !== undefined) {
      project.technologies = Array.isArray(technologies)
        ? technologies
        : technologies.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (liveUrl !== undefined) project.liveUrl = liveUrl;
    if (image !== undefined) project.image = image;
    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (role !== undefined) project.role = role;

    await project.save();

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('projectUpdated', project);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('projectUpdated', project);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    console.error('[Project Controller - UpdateProject]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update project',
    });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Student)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findOneAndDelete({ _id: id, studentId: req.user._id });
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found or unauthorized',
      });
    }

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('projectDeleted', id);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('projectDeleted', id);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Project deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('[Project Controller - DeleteProject]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete project',
    });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
