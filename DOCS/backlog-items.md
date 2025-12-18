Backlog Items
Feature: party-organize
As a party creator, I want to organize birthday parties and create a group of guests.
As a party creator, I would like to see a section of available event venues in my city to organize a party.(Requires: feature-event-services)
As a party creator, I would like to specify the event date, location, and other details.
As a party creator, I would like to know how many guests have confirmed attendance.
As a party guest, I would like to confirm my attendance.
As a party guest, I would like to clearly see the event location, date, and time.
Feature: event-services
As a party creator, I would like to see available professionals in my city (photographers, DJs, entertainers, music bands, catering services, etc.).
As a party creator, I would like to request availability and pricing for event services.
As a party creator, I would like to easily pay service providers directly from the app.
As a party creator, I would like the app to provide some type of guarantee regarding service fulfillment.
As a party creator, I would like to see reviews of professionals offering services.
As a party creator, I would like to leave feedback about the service provided.
As a professional, I would like to showcase my services, including an image and basic information (to be defined).
As a professional, I would like to be paid easily through the app.
As a professional, I would like to promote my services to increase visibility, even if I have to pay for it.
Feature: avatar
As a user, I would like to have a personal avatar instead of a generic icon.
Feature: gift-recommendations
As a party guest, I would like to see gift recommendations for the birthday person.
Feature: collaborative-collage
As a group gifting member, I would like to create a collaborative collage with other group members as a gift.
As a collaborative collage member, I would like to write text or upload an image.
As a collaborative collage member, I would like the collage to be created automatically.
As the organizer of a collaborative collage, I would like to edit the collage before final approval.
As a collaborative collage member, I would like to send the collage to the birthday person via the app, WhatsApp, or email.
As the organizer of a collaborative collage, I would like to receive a physical printed version or send it directly to the birthday person.
As the organizer of a collaborative collage, I would like to choose colors for the collage.
As the organizer of a collaborative collage, I would like to choose styles for the collage.
As the recipient of the collaborative collage, I would like it to have the ideal format for sharing on Instagram and Facebook.
Feature: collaborative-reel
As a group gifting member, I would like to create a collaborative Reel with other group members as a gift.
As a collaborative Reel member, I would like to write text, upload an image, upload audio, or upload video.
As a collaborative Reel member, I would like the Reel to be created automatically.
As the organizer of a collaborative Reel, I would like to edit the Reel before final approval.
As the organizer of a collaborative Reel, I would like to choose Reel styles.
As the organizer of a collaborative Reel, I would like to choose background music.
As a collaborative Reel member, I would like to send the Reel to the birthday person via the app, WhatsApp, or email.
As the recipient of the collaborative Reel, I would like it to have the ideal format for sharing on Instagram and Facebook.
Backend Requirements
Backend – Feature: event-services
As a product owner, I want a system that keeps the list of available services in my city up to date (photographers, DJs, etc.) so I can contact them and include them in the app.
Acceptance Criteria:
The system must be able to run periodically (e.g., weekly) to detect new available services.
The system must return:
Name
Website
Phone number
Service title
Service description
Backend – Feature: gift-recommendations
As a product owner, I want a gift recommendation system based on the user’s profile, with a psychological and scientific foundation, so recommendations are meaningful and improve the user’s life.
Acceptance Criteria:
Recommendations must consider the user profile.
Recommendations must be based on psychological and scientific studies supporting personal growth and well-being.
Harmful products must not be recommended, regardless of potential advertising revenue.
A filter must prioritize local businesses over any other recommendations.
UI / System Requirements
UI – Feature: event-services
Paid professional profile positioning system so providers can pay to have their services highlighted.
System – Feature: avatar
As a product owner, I want a system that allows users to upload a photo of their face and automatically generate an avatar.
Acceptance Criteria:
Only the face is used (no body).
System – Feature: collaborative-collage
As a product owner, I want a system that collects user inputs and automatically creates a collage.
Acceptance Criteria:
Automatic collage generation.
Post-editing capabilities for the organizer.
Ability to choose colors and styles.
Output format suitable for Instagram and Facebook sharing.
System – Feature: collaborative-reel
As a product owner, I want a system that collects user inputs and automatically creates a Reel.
Acceptance Criteria:
Automatic Reel generation.
Post-editing capabilities for the organizer.
Ability to choose music.
Ability to choose styles.
Output format suitable for Instagram and Facebook.
If you want, I can next:
Normalize this into Jira Epics → Features → Stories
Reduce it to a realistic MVP backlog
Rewrite it as a PRD or investor-ready roadmap
Align it with technical architecture (AI / backend / payments)
