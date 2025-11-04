# Lab 9: Reclaiming a "Brown Field" and Final Tooling Practice 

## Learning Objectives

- Take exiting brownfield code (in this case AI-generated) and make it your own by adding quality testing, docs, and modifications to suit you.
- Work with dependencies and new tech thrown at you for "reasons" in this case Lit and Vite 
- Set up and use GitHub Actions for continuous integration and deployment
- Organize a repository to develop your own style
- Employ unit tests and E2E tests to ensure quality
- Use JSDocs to add type checking and documentation generation
- Use Github issues to track your work.  This means you need to write something down before you do it!  Plan then code.
- You must add some of your own ideas that YOU think are useful or interesting to demonstrate creativity and ownership


This is the **final warm-up lab** before your team project. Unlike previous labs that focused heavily on coding concepts, this lab is a final chance to practice and mostly reviews what you have already done in new context.  It is meant to also allow you a chance to experiment and practice on your own **BEFORE** you start working with others and doing something from scratch. The main new thing here is using GitHub actions and showing you can attempt some of our previous efforts in a new context.  


> IMPORTANT: This lab is about developing professional habits. The code is intentionally simple and roughly works, but it is purposefully AI-generated and represents "brown field" code some might call AI slop that is in a bit of a poor state. The lab allows you to practice dealing with such code and putting all the things you have already done together to derisk this approach.  You may have done this already, but now you aren't the one generating it. 
> These skills will be critical for your upcoming project work and likely your career beyond by the looks of things so take the time by yourself to do the best you can.  This is the most subjective of the labs, but as such it will be the most lenient on grading.  Effort is what I need to see here so that you derisk the project which we spend our final ~6 weeks working on.
> 

## Lab Overview

You have been given this simple **Task Management Application** using Lit web components that demonstrate:
- Modern web component architecture
- Clean MVC separation
- localStorage persistence
- Responsive design
- Accessibility features

However, it was vibed and as such likely could be a hot mess.  It has a few unit tests, it has limited docs, linting was implemented, e2e testing is not there, and visually it looks pretty bad.  Who knows how bad the code could be!  I didn't look, but you will!

Your job is get this slop code in your repo `lab9-the-final-warmup` and bring everything you can think of to clean this "pretty much done" code to a better state.  Obvious things include:

- repo organization
- refactored and linted code
- unit test covered code
- e2e tested code
- JSDocs with doc generation
- ADRs documenting the choice of why one might use Lit or maybe we shouldn't use it!  

> You likely have no idea what Lit does. You'll need to research it and compare it to what you have done.  Given our industry is throwing many things at us, we have to be comfortable seeing depedencies introduced and getting comfortable with them.  This one is purposefully much easier to contend with than, say, Vue or React!  Imagine getting generated code for something that is much farther from the web components and basic JS we have done!

- A pipeline that runs tests, docs, linting, etc. with Github actions when you push and deploys to either Cloudflare, Netlify, or other host as you see fit
- As always you must provide proof you are using Github issues to track your progress and Git to track your changes
- A readme linking to your deployed site, so I can see it work and know you are ready to build something of your own


## Rubric

### GitHub Workflow & Process (60 points)

The least prescriptive of all the tasks this effort and outcome based.  You get up to 20 points if you turn in something that works and does the bare minimum of having linting, unit testing, and deployment with little refactor.  You get up to 40 points if you turn in something that adds in e2e, docs, and does some refactor.  You get up to 60 points if this is now your code.   Your code means you have applied most if not all the previous concepts like good commit messages, use issues, tag versions, have testing, can generate docs, and it can do some things you decided YOU wanted to do out of personal interest.  To get those precious points your readme should advise me of all that.  Being the lazy technical leader I am I have no time to dig through your code, you better tell me what you did! 

---

## Submission

Submit your GitHub repository URL that demonstrates with a README that clearly points to your deployed TODO.


Good luck! Remember to focus on process more than code. The lab is also intentionally vague as your final warm-up before we wrestle with **REAL** uncertainty!  You are free to ask me for advice about ideas you have, things you might do to show ownership, etc. Who knows that might be an actual learning outcome.