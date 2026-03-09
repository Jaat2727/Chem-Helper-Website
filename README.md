# 🧪 ChemSAGE — Smart Academic Growth Environment

> A student-built platform designed for the Chemistry Department to streamline academics, collaboration, and campus life.

**Approach:** Mobile-First Design (V. Imp)

---

## 📋 Table of Contents

1. [Introduction](#1-introduction)
2. [Team & Contacts](#2-team--contacts)
3. [Authentication & Login](#3-authentication--login)
4. [User Profile](#4-user-profile)
5. [Home Page](#5-home-page)
6. [Question Paper Upload](#6-question-paper-upload)
7. [Resources Sharing](#7-resources-sharing)
8. [Timetable](#8-timetable)
9. [Assignment Tracker](#9-assignment-tracker)
10. [Group Study & Hangout Planner](#10-group-study--hangout-planner)
11. [Self Attendance Tracker](#11-self-attendance-tracker)
12. [Real-Time Chat](#12-real-time-chat)
13. [Notifications](#13-notifications)
14. [Course Groups](#14-course-groups)
15. [Labs](#15-labs)
16. [Gallery](#16-gallery)
17. [News Footer (Floating)](#17-news-footer-floating)
18. [Admin Panel](#18-admin-panel)
19. [Notes for Contributors](#19-notes-for-contributors)
20. [TBD / Future Ideas](#20-tbd--future-ideas)

---

## 1. Introduction

ChemSAGE is a student-built platform aimed at creating a unified digital space for the Chemistry department. This document lists all planned pages, features, and systems. It serves as a **working draft** — contributors are encouraged to expand sections and add details as the project evolves.

---

## 2. Team & Contacts

| Name    | Phone          |
| ------- | -------------- |
| Nishu   | +91 8607504876 |
| Kanishk | +91 9953301113 |
| Parvesh | +91 7419045750 |
| Mayank  | +91 7988461647 |

---

## 3. Authentication & Login

A mobile-first login system supporting two user roles.

### User Roles

| Role        | Description                                                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Student** | Logs in via their institute **smail**. Can set a password; OTP verification is sent to smail. Can also contact admin for access issues. |
| **Admin**   | Has all student permissions **plus** the ability to manage documents, uploads, and moderate content.                                    |

### Planned Elements

- Email-based login (smail)
- OTP verification
- Account creation & password setup
- Profile creation flow
- Admin escalation / contact option

---

## 4. User Profile

A LinkedIn-style profile system for each user.

### Profile Fields

- **Name**
- **Batch / Year**
- **Courses Enrolled**
- **Interests / Research Areas**

---

## 5. Home Page

The landing page after login — sets the tone of the platform.

### Planned Elements

- Personalized **greeting message**
- **Curtain / door opening animation** on first load
- **Quick navigation** cards to all major sections
- Persistent **footer** with ChemSAGE branding

---

## 6. Question Paper Upload

A dedicated page for managing previous-year question papers.

### Features

- Admin can **upload** question papers
- Organized by course, semester, and year
- Students can **browse and download** papers
- Search and filter functionality

---

## 7. Resources Sharing

> 🔒 **Only available to logged-in users.**

A collaborative resource-sharing hub for the entire department.

### Features

- **Resource dump** — all resources for a single year across all subjects in one place
- **Global search** across all shared resources
- Students can **upload and share** their own materials
- **Folder structure** — organized by course/semester/topic
- **Tagging system** with tags such as:
  - `Course`
  - `Topic`
  - `Semester`
  - `Resource Type` (notes, slides, books, videos, etc.)

---

## 8. Timetable

Displays the class schedule for students.

### Planned Views

- **Weekly timetable** — full week at a glance
- **Daily schedule** — focused view for the current day
- Integration with [Attendance Tracker](#11-self-attendance-tracker) for class cancellation updates

---

## 9. Assignment Tracker

A tracker to keep students on top of their assignments and deadlines.

### Fields

| Field          | Description                        |
| -------------- | ---------------------------------- |
| **Course**     | Which course the assignment is for |
| **Assignment** | Title or description               |
| **Deadline**   | Due date & time                    |
| **Status**     | Pending / In Progress / Submitted  |

---

## 10. Group Study & Hangout Planner

A planner to foster collaborative learning among students — designed to be **beneficial for both Bio and Maths stream students**.

### Features

- **Create** a study session (set topic, time, location)
- **Join** an existing study session
- **Plan hangouts** and social meetups
- Goal: build a healthy learning environment that bridges different streams

---

## 11. Self Attendance Tracker

A personal attendance tracking system with support for Class Representatives (CRs).

### How It Works

- Class schedule is uploaded to the platform
- Students can **mark their own attendance** for each class
- If a class gets **cancelled**, the CR updates the timetable so it reflects for everyone

### CR Privileges

- CRs have additional authority to **mark cancellations** and **update schedules**

### Fields

| Field                | Description                |
| -------------------- | -------------------------- |
| **Course**           | Course name                |
| **Total Classes**    | Number of classes held     |
| **Classes Attended** | Number of classes attended |
| **Attendance %**     | Auto-calculated percentage |

---

## 12. Real-Time Chat

An in-app messaging system for instant communication.

### Includes

- **Course group chat** — one chat per enrolled course
- **Direct messages (DMs)** — student-to-student private messaging

---

## 13. Notifications

A multi-channel notification system to keep users informed.

### Notification Triggers

- Upcoming **deadlines**
- **Replies** to posts / messages
- New **question paper uploads**
- New **resource uploads**
- Event announcements

### Notification Channels

| Channel                | Description                   |
| ---------------------- | ----------------------------- |
| **Website**            | In-app notification bell      |
| **Email**              | Summary or real-time to smail |
| **Push Notifications** | Browser / mobile push alerts  |

---

## 14. Course Groups

Course-specific discussion forums.

### Structure (per course)

- **Faculty Announcements** — official updates from professors
- **Student Discussions** — peer Q&A, doubts, and discussions
- **Group Chat** — real-time informal conversation

---

## 15. Labs

A dedicated section for lab-related materials and information.

### Planned Content

- Lab manuals and experiment write-ups
- Safety guidelines
- Lab schedules
- Organized by course / semester

---

## 16. Gallery

A visual showcase for department events, achievements, and memories.

### Planned Content

- Event photos (fests, seminars, workshops)
- Department activities
- Student achievements
- Contributor-uploaded content

---

## 17. News Footer (Floating)

A continuously visible floating footer bar labeled **"NEWS"** that keeps students updated.

### Content

- 📅 **Session Tracking** — BS class-specific sessions and departmental talks
- 🎉 **Event Updates** — upcoming and ongoing events
- 🏆 **Previous Winners** — past competition / award winners
- 🎤 **Seminars & Talks** — important seminars, POR opportunities, and talk sessions happening outside the department
- 📢 **General Announcements**

---

## 18. Admin Panel

A centralized dashboard for admins to manage the platform.

### Admin Capabilities

- **Document Management** — upload, edit, delete question papers and resources
- **Content Moderation** — review and moderate user-uploaded content
- **User Management** — manage roles, handle access issues
- **Timetable Updates** — update schedules and cancellations
- **Announcements** — post official notices and news items

---

## 19. Notes for Contributors

> This document is a **living draft** being edited collaboratively by the team.

### You Can Contribute

- 📄 Additional **pages** or feature ideas
- 🎨 **UI/UX** design suggestions
- 🏗️ **System architecture** proposals
- 🔧 **Feature details** and specifications
- 🐛 Bug reports and improvement ideas

### How to Contribute

1. Fork the repository
2. Create a new branch for your changes
3. Edit this README or add new docs
4. Submit a Pull Request with a clear description

---

## 20. TBD / Future Ideas

- _This section is reserved for features and ideas that are still being discussed._
- _Team members can add suggestions here for future sprints._

---

<p align="center">
  <b>ChemSAGE</b> — Built with ❤️ by Chemistry Students<br>
  <i>Smart Academic Growth Environment</i>
</p>
