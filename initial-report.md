
Information Systems Project
Assignment Spring 2025
Interim Report
SYED SARMAD HASSAN GILLANI
Centre Name : NCC Education
NCC Education ID : 215615
Submission Date : 23rd May 2025





Statement and Confirmation of Own Work

Programme/Qualification
BSc (Hons) Cyber Security and Networking
All NCC Education/UCLan assessed assignments submitted by students must have this statement as the cover page or it will not be accepted for marking. Please ensure that this statement is either firmly attached to the cover of the assignment or electronically inserted into the front of the assignment.

Student declaration

I have read and understood both UCLan’s Assessment Handbook and NCC Education’s Referencing and Bibliographies document (available on the main course page of the VLE). To the best of my knowledge my work has been accurately referenced and all sources cited correctly.

I can confirm the following details:

Student ID/Registration number:	

Name: Syed Sarmad Hassan Gillani 

Centre Name: NCC Education 

Module Name: Information Systems Project 

Module Leader: Steve Wade 

Number of words: 1141 words 
 
I confirm that this is my own work and that I have not colluded or plagiarised any part of it.

Due Date: 23rd May 2025 
Student Signature:                            
Submitted Date: 23rd May 2025



Table of Contents


1. Background & Research.....................................4
2. Development...............................................5
3.Appendix 1 – UX Wireframe (Fig 1.0)..........................6
4. Learning..................................................7
5.Appendix 2 – Gantt Chart Timeline (Fig 2.0)..................8
6. Progress Summary……………........................................9
7. References……………….................................................10












Doughlicious : A Digital Transformation for Donut Shops
 
A tailored approach that could involve creating an e-solution that enhances shopping, inventory management, and customer awareness for mom-and-pop doughnut shops.
1. Background & Research 
The very need for artisanal cakes and the experience of taking personalized food has been very continuous through time and the global doughnut market would amount to over USD 11.22 billion by 2024 (Fortune Business Insights, 2024). However, small donut shops remain really underserved on the digital aspect because they are still not equipped with scalable platforms in online ordering, customer retention and inventory management. Doughlicious is the answer to this gap with a dedicated web application that is built on top of gourmet donut sales.

A primary survey discovered that 78% prefer using a donut-only application to a general bakery application. Existing platforms like Uber Eats and Deliveroo provide generic listing access, but there is no such thing as real-time inventory, loyalty schemes, or donuts custom options (Statista, 2023). Which adds necessity for a unique app like Doughlicious.
The selected stack (Next.js, Supabase, and Clerk) includes Server-Side Rendering, scalable data storage & secure role-based authentication. These are modern technologies that allow for speedy development of applications from the ground up. The purposes of this project include the implementation of a modern safe ordering mechanism equipped with loyalty integration and real-time updates.

The objectives include: 
• Responsive front-end UI using Tailwind and shadcn/ui.
• Set up a secure back end with authentication and role controls using necessary SQL Tables and configuration. 
• Implement Stripe payment with loyalty tracking. 
• Publish github repository live MVP on Vercel for testing and final demo.

 
2. Development 
The development commenced with two stakeholder interviews of bakery shop owners and regular buyers. Then, 20 user stories were extracted into Jira from customer login and checkout to admin inventory updates (Atlassian, 2024).

Wireframes were designed with the help of Mermaid JS (MermaidJS, 2025) and some usability tests were carried out to test these wireframes. The UI emphasized mobile responsiveness; hence the hamburger menu redesign was adopted after initial take as feedback. (Appendix A) 

Frontend was built up using Next.js and Tailwind CSS. Pages developed include Home, Product Listing, and Cart. Dynamic routing and SSR were used for SEO-friendly product detail pages.

Setting up the backend still work in progress Supabase Postgress database and Clerk for auth. Tables include products, users, orders, and loyalty history. Supabase's row-level security (RLS) features will be applied to restrict data by user role (Supabase, 2025).

Stripe integration is next, currently going through the developer docs to get a full understanding which would make sure that payment methods are secure through tokenization (Stripe, 2025). This is what the MVP is hosted on: Vercel, which has automated CI/CD and environment separation (Vercel, 2025). A GitHub Actions workflow will be added for deployment.

So far, the MVP supports browsing, cart management, registration, and admin login are in testing & loyalty and inventory modules are under progress. Dev tools used include Prisma ORM, Prettier, GitHub Projects, Lighthouse for performance testing, and so on.




 
 
Appendix 1 (Fig 1.0) : This illustrates briefly the screen flow (UX) for the Doughlicous platform divided into two primary roles (admin,user) with correct presets, This was the key for starting the project as it helped highlight key interaction path like authentication, loyalty tracking, product search feature, inventory management, order flow & checkout, Designed using  MermaidJS.  (MermaidJS, 2025) 
3. Learning
In the first semester of developing Doughlicious there were several fundamental areas of technical and professional knowledge that were consolidated. These directly reflect the completed phases as shown in Appendix 2 (Fig 2.0)

React State Management
The whole idea of implementing the frontend modules using a functional component architecture of React made heavy use of useState, useEffect, and useContext for global states like cart data and user sessions (React, 2025). In order to avoid prop drilling, Context API was used, thereby achieving a consistent data flow across components authenticated and guest.

Authentication & Role Access
Clerk was the identity management software for sign-up, sign-in, and session management. The system had the following functionalities: routing protection, user claims, and role access control differentiating access admin (Clerk, 2025). The JWT tokens were saved in the browser and verified by Clerk through its middleware.

Database Schema Design
A normalized schema within Supabase now allows real-time updates of orders, categorized products, and loyalties point tracking. Foreign keys were used to create relational structures mapping users, orders, products, and reward history. The row-level security (RLS) policies within Supabase were set up to enforce access control based on user roles (Supabase, 2025).
Deployment & Staging
As far as the deployment pipeline is concerned, proper integration of GitHub Actions with Vercel has been done. Staging and production builds, separated from each other, allow for pull requests and automated preview deployment. This way, a smooth flow can be assured during the development for Frontend, Backend, and Auth (Vercel, 2025).



UX & UI Design Principles
The wireframes and high-fidelity mockups were built in Figma and validated through remote usability testing. The users delivered their feedback, which was synthesized back into iteration improvements within the designs, particularly in respect to the hierarchy of navigation and button placements (MermaidJS, 2025). These initial user-facing pages were designed with a mobile-first layout priority in mind.

Security Compliance Awareness
During the setup of Clerk and Supabase, attention was paid also to GDPR and PCI compliance. Cookie banners and opt-in tracking mechanisms were delineated, and secure token-based flows for payment preparations were implemented with reference to the Stripe documentation (Stripe, 2025). These lessons will thus set the basis for how we will implement secure payments and user data handling in the next levels.
 
4. Planning and Progress 
                              
Appendix 2 (Fig 2.0) – Gantt Chart Roadmap was manually coded using HTML & CSS (Mozilla Developer Network, 2025)
 
5. Progress Summary
All milestone bases  such as research, wireframing, frontend interface, and secure backend setup are done.
The Stripe payment and loyalty points modules are being developed and will be completed by mid-June.
The project is still on track under the initial plan, with no significant setbacks so far.
Second Semester Outlook (June–August 2025)
Projected deliverables for Semester 2 are:
Implementing Stripe and loyalty systems with error handling
Admin Dashboard development, such as product, order, and inventory management features
Implementation of automated and manual performance testing (mobile & desktop)
Documentation finalization, user guide development, and demo preparation by 31-08-2025
Risk Assesment & Mitigation 
Risk	Mitigation Strategy
Stripe API instability or downtime	Integration via sandbox mode and async retry logic cash-on-delivery as a fallback option
Unexpected scope or overruns	2 Week buffer is built into the final phase for documentation and testing
UI responsiveness issues across devices	Scheduled browser/device testing during the Testing & Optimisation phase
Admin panel delivery delays	Focus prioritised on inventory and order features first reporting functions deferred if needed
 
5. References 

Mozilla Developer Network (2025) CSS Layout and Styling Techniques. Available at: https://developer.mozilla.org/en-US/docs/Web/CSS [Accessed 10 April 2025].
Atlassian (2024) Jira Software. Available at: https://www.atlassian.com/software/jira (Accessed: 15 April 2025).
Clerk (2025) Docs. Available at: https://clerk.com/docs (Accessed: 15 April 2025).
MermaidJS (2025) Documentation. Available at: https://mermaid.js.org/ (Accessed: 17 April 2025).
Fortune Business Insights (2024) Doughnuts Market Size, Share & Industry Analysis. Available at: https://www.fortunebusinessinsights.com/doughnuts-market-104339 (Accessed: 20 April 2025).
Next.js (2024) About Next.js. Available at: https://nextjs.org/learn/foundations/about-nextjs (Accessed: 22 April 2025).
Statista (2023) Online food delivery - worldwide. Available at: https://www.statista.com/outlook/emo/online-food-delivery/worldwide?currency=USD (Accessed: 22 April 2025).
React (2025) Hooks API reference. Available at: https://reactjs.org/docs/hooks-intro.html (Accessed: 1 May 2025).
Rich’s USA (2025) 2025 Dessert Trends. Available at: https://www.richsusa.com/resources/insights-for-growth-how-desserts-bring-us-together-in-2025 (Accessed: 2 May 2025).
shadcn/ui (2025) Components. Available at: https://ui.shadcn.com (Accessed: 3 May 2025).
Snack & Bakery (2024) 'State of the Industry 2024'. Available at: https://www.snackandbakery.com/articles/111449-state-of-the-industry-2024-shoppers-still-seek-sweet-treats (Accessed: 4 May 2025).
Stripe (2025) Payment integration guide. Available at: https://stripe.com/docs/payments (Accessed: 5 May 2025).
Supabase (2025) Documentation. Available at: https://supabase.com/docs (Accessed: 6 May 2025).
Tailwind CSS (2025) Documentation. Available at: https://tailwindcss.com/docs (Accessed: 7 May 2025).
Vercel (2025) Documentation. Available at: https://vercel.com/docs (Accessed: 8 May 2025).

