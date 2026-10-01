import {
  Award,
  Bot,
  Calendar,
  Code,
  Cpu,
  FolderOpen,
  Heart,
  Lightbulb,
  Shield,
  Trophy,
  Users,
  Wrench,
} from "lucide-react";

export const club = {
  name: "Basmat-Muhandis",
  nameAr: "بصمة مهندس",
  tagline: "An engineer's fingerprint on everything we build.",
  email: "basmatmuhandis@gmail.com",
  location: "University Campus, Algeria",
  founded: 2019,
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
  },
};

export const navLinks = [
  { key: "home", path: "/" },
  { key: "about", path: "/about" },
  { key: "projects", path: "/projects" },
  { key: "events", path: "/events" },
  { key: "gallery", path: "/gallery" },
  { key: "team", path: "/team" },
  { key: "partners", path: "/partners" },
  { key: "contact", path: "/contact" },
];

export const stats = [
  { icon: Users, value: 150, suffix: "+", key: "members" },
  { icon: FolderOpen, value: 30, suffix: "+", key: "projects" },
  { icon: Calendar, value: 50, suffix: "+", key: "events" },
  { icon: Award, value: 5, suffix: "+", key: "years" },
];

export const pillars = [
  { icon: Bot, key: "robotics" },
  { icon: Code, key: "programming" },
  { icon: Cpu, key: "electronics" },
  { icon: Wrench, key: "workshops" },
];

export const values = [
  { icon: Lightbulb, key: "innovation" },
  { icon: Users, key: "collaboration" },
  { icon: Heart, key: "passion" },
  { icon: Shield, key: "excellence" },
];

export const timeline = [
  { year: "2019", title: "Club Founded", desc: "Basmat-Muhandis was established by a group of passionate engineering students." },
  { year: "2020", title: "First Robotics Project", desc: "Launched our first autonomous robot, sparking interest across campus." },
  { year: "2021", title: "National Competition", desc: "Represented the university at a national engineering competition." },
  { year: "2022", title: "Community Workshops", desc: "Began organizing open workshops for all university students." },
  { year: "2023", title: "Growing Impact", desc: "Reached 100+ active members and 20+ completed projects." },
  { year: "2024", title: "Expanding Horizons", desc: "Partnerships with industry and international collaborations." },
];

export const projectCategories = ["All", "Robotics", "Programming", "Electronics", "Workshops", "Competitions"] as const;

export const categoryIcons: Record<string, React.ElementType> = {
  Robotics: Bot,
  Programming: Code,
  Electronics: Cpu,
  Workshops: Wrench,
  Competitions: Trophy,
};

export const projects = [
  { title: "Line Follower Robot", desc: "An autonomous robot that follows a black line using IR sensors and PID control.", cat: "Robotics", year: "2024", tags: ["Arduino", "PID", "Sensors"] },
  { title: "Smart Campus App", desc: "Mobile app for campus navigation, schedules, and student resources.", cat: "Programming", year: "2024", tags: ["React Native", "API"] },
  { title: "IoT Weather Station", desc: "Real-time weather monitoring with Arduino, sensors, and a cloud dashboard.", cat: "Electronics", year: "2024", tags: ["IoT", "MQTT", "Cloud"] },
  { title: "Obstacle Avoidance Bot", desc: "A robot using ultrasonic sensors to navigate around obstacles autonomously.", cat: "Robotics", year: "2023", tags: ["Ultrasonic", "C++"] },
  { title: "Club Website", desc: "A modern responsive website to showcase the club's activities and projects.", cat: "Programming", year: "2025", tags: ["React", "TypeScript"] },
  { title: "Arduino Workshop", desc: "Hands-on workshop introducing students to microcontrollers and circuits.", cat: "Workshops", year: "2023", tags: ["Beginner", "Hardware"] },
  { title: "National Robotics Challenge", desc: "Competed in the national robotics competition, finishing in the top 5.", cat: "Competitions", year: "2023", tags: ["Top 5", "National"] },
  { title: "LED Matrix Display", desc: "A programmable LED matrix display for messages and animations.", cat: "Electronics", year: "2022", tags: ["PCB", "Firmware"] },
  { title: "Python Bootcamp", desc: "A week-long intensive Python programming course for beginners.", cat: "Workshops", year: "2022", tags: ["Python", "Bootcamp"] },
];

export const events = [
  { date: "Mar 2025", title: "Robotics Exhibition", type: "Exhibition", desc: "Showcasing our latest robots and automation projects to the public.", upcoming: true },
  { date: "Feb 2025", title: "AI & Machine Learning Seminar", type: "Seminar", desc: "An expert-led seminar on the fundamentals and applications of AI.", upcoming: true },
  { date: "Jan 2025", title: "Arduino Workshop", type: "Workshop", desc: "Hands-on introduction to Arduino programming and circuit design.", upcoming: false },
  { date: "Dec 2024", title: "End-of-Year Celebration", type: "Event", desc: "Celebrating the achievements and milestones of the year.", upcoming: false },
  { date: "Nov 2024", title: "Hackathon 2024", type: "Competition", desc: "24-hour hackathon focused on building solutions for campus problems.", upcoming: false },
  { date: "Oct 2024", title: "Electronics Salon", type: "Exhibition", desc: "An interactive salon featuring IoT and embedded systems projects.", upcoming: false },
];

export const partners = [
  { name: "University of Technology", type: "Academic" },
  { name: "National Robotics Association", type: "Association" },
  { name: "TechStartup Inc.", type: "Industry" },
  { name: "Arduino Community Algeria", type: "Community" },
  { name: "Google Developer Groups", type: "Community" },
  { name: "IEEE Student Branch", type: "Association" },
];

export type Member = {
  name: string;
  role: string;
  /** Optional short line shown under the role */
  bio?: string;
  /** Optional photo in /public — falls back to initials when absent */
  photo?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
};

/**
 * Board and team members.
 * Keep the highest-ranking roles first — the page renders the first two as
 * featured cards and the rest in the grid below.
 */
export const team: Member[] = [
  { name: "Ahmed Bensalem", role: "President" },
  {
    name: "Defrour Yasser",
    role: "Vice President",
    facebook: "https://www.facebook.com/share/1GwYVK8LQn/",
    instagram: "https://www.instagram.com/defrour_yasser?igsh=MWlxbTBveGQ2MW5jNg==",
    linkedin: "https://www.linkedin.com/in/yasser-defrour-b7279526b",
  },
  { name: "Yassine Khelifi", role: "Technical Lead" },
  { name: "Sara Mekki", role: "Communications Manager" },
  { name: "Omar Boudiaf", role: "Robotics Coordinator" },
  { name: "Amina Hadj", role: "Events Coordinator" },
  { name: "Karim Djelloul", role: "Programming Lead" },
  { name: "Nour Belkadi", role: "Design Lead" },
];
