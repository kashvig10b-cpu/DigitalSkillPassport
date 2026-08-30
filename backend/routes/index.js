const express = require('express');
const router = express.Router();

const healthRouter = require('./health');
const authRouter = require('./auth');
const profileRouter = require('./profile');
const skillRouter = require('./skills');
const projectRouter = require('./projects');
const certificateRouter = require('./certificates');
const achievementRouter = require('./achievements');
const educationRouter = require('./education');
const experienceRouter = require('./experience');
const adminRouter = require('./admin');
const passportRouter = require('./passport');
const recruiterRouter = require('./recruiter');

const os = require('os');

const getLanIp = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (/wi-fi|wireless|wlan/i.test(name) || /^10\.|^192\.168\./.test(net.address)) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
};

router.get('/network-info', (req, res) => {
  const lanIp = getLanIp();
  res.json({
    status: 'success',
    data: {
      lanIp,
      port: 5173,
      baseUrl: `http://${lanIp}:5173`
    }
  });
});

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/skills', skillRouter);
router.use('/projects', projectRouter);
router.use('/certificates', certificateRouter);
router.use('/achievements', achievementRouter);
router.use('/education', educationRouter);
router.use('/experience', experienceRouter);
router.use('/admin', adminRouter);
router.use('/passport', passportRouter);
router.use('/recruiter', recruiterRouter);

module.exports = router;
