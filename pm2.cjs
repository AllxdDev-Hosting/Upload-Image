module.exports = {
   apps: [
      {
         name: "uploader",
         script: "yarn",
         args: "start",
         interpreter: "none",
         env: {
            NODE_ENV: "production"
         }
      }
   ]
}