import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MODULES } from '@/data/modules';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  BookOpen,
  Beaker,
  ArrowRight,
  Brain,
  Target,
  Lightbulb,
  Play,
  CheckCircle2,
  Monitor,
  Code,
  Sparkles,
  ChevronDown,
  BookText,
  Cpu
} from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import OpeningAnimation from '@/components/OpeningAnimation';

// SRM Logo Component
const SRMLogo = ({
  className = "h-10 sm:h-12",
  imgClassName = "w-14 h-14 sm:w-24 sm:h-24",
  hideText = false,
  titleClassName = "text-xl sm:text-2xl",
  subtitleClassName = "text-sm sm:text-base",
  gapClassName = "gap-3"
}: {
  className?: string;
  imgClassName?: string;
  hideText?: boolean;
  titleClassName?: string;
  subtitleClassName?: string;
  gapClassName?: string;
}) => (
  <div className={`flex items-center ${gapClassName} ${className}`}>
    <div className="relative flex-shrink-0">
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="SRM Logo"
        className={`object-contain ${imgClassName}`}
      />
    </div>
    {!hideText && (
      <div className="flex flex-col leading-tight pt-0.5">
        <span className={`font-bold text-blue-600 dark:text-blue-400 tracking-tight ${titleClassName}`}>SRM</span>
        <span className={`font-bold text-foreground -mt-1 ${subtitleClassName}`}>Virtual Labs</span>
      </div>
    )}
  </div>
);

// Syllabus Data
const SYLLABUS_UNITS = [
  {
    unit: 1,
    title: "Introduction to Artificial Intelligence",
    topics: [
      "Introduction to AI, AI vs Non-AI Techniques",
      "Knowledge Representation, Knowledge-Based Systems",
      "State Space Search",
      "Blind Search: Depth First Search (DFS), Breadth First Search (BFS)",
      "Informed Search: Heuristic Function, Hill Climbing, Best First Search, A*, AO*",
      "Intelligent Agents, Environments",
      "Problem Solving Agents"
    ]
  },
  {
    unit: 2,
    title: "Applications of AI",
    topics: [
      "Supervised Machine Learning",
      "Issues in Supervised Learning Algorithms",
      "Dimensionality Reduction Methods",
      "Self-Organizing Maps (SOM), Sammon Mapping",
      "Recommender Systems",
      "Knowledge Modelling using UML",
      "Case Study: Clinical Practice Guideline Recommendations"
    ]
  },
  {
    unit: 3,
    title: "Ontology Learning for Semantic Web",
    topics: [
      "Semantic Web Introduction",
      "Ontologies and Knowledge Representation",
      "Ontology Learning Algorithms",
      "Ontology Evaluation Methods",
      "Semantic-Based Navigation for Information Retrieval",
      "Ontology-Based Management of Pervasive Systems",
      "DIYD (Do-It-Yourself Development)"
    ]
  },
  {
    unit: 4,
    title: "Intelligent Human-Computer Interaction & Health",
    topics: [
      "High-Level Concept Detection in Video",
      "Intelligent Human-Computer Interaction (HCI)",
      "Medical Image Analysis using Wavelets",
      "Automated Pressure Ulcer Diagnosis",
      "Fuzzy Systems in Biomedicine",
      "Gene Expression Interpretation",
      "AI Systems for Skin Cancer Diagnosis"
    ]
  },
  {
    unit: 5,
    title: "Real World AI Applications",
    topics: [
      "Intrusion Detection Systems",
      "Smart Antenna Prediction Models",
      "Video Watermarking Techniques",
      "Face Detection Systems",
      "Robotic Sensor Networks",
      "Composite Web Services from Autonomous Components"
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};


const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const Section = ({ children, className = "", id = "" }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.section>
  );
};

export default function Landing() {
  const [openUnits, setOpenUnits] = useState<number[]>([1]);
  const [showOpening, setShowOpening] = useState(() => {
    return !sessionStorage.getItem("hasVisited");
  });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const toggleUnit = (unit: number) => {
    setOpenUnits(prev =>
      prev.includes(unit)
        ? prev.filter(u => u !== unit)
        : [...prev, unit]
    );
  };

  const learningOutcomes = [
    { icon: Brain, text: "Apply AI problem-solving techniques to real-world scenarios" },
    { icon: Target, text: "Implement search algorithms including DFS, BFS, A*, and Hill Climbing" },
    { icon: Sparkles, text: "Design and develop fuzzy logic systems for decision making" },
    { icon: Code, text: "Build machine learning applications for prediction and classification" },
    { icon: Lightbulb, text: "Create ontology-based knowledge representation systems" },
    { icon: Monitor, text: "Develop interactive AI-powered web applications" },
  ];

  const interactiveFeatures = [
    {
      icon: Play,
      title: "Algorithm Visualizations",
      description: "Step-by-step animated demonstrations of AI algorithms with adjustable parameters"
    },
    {
      icon: Beaker,
      title: "Interactive Demos",
      description: "Hands-on experiments to test and modify algorithm behavior in real-time"
    },
    {
      icon: Code,
      title: "Code Examples",
      description: "Well-documented Python and JavaScript implementations for each lab"
    },
    {
      icon: BookOpen,
      title: "Practice Exercises",
      description: "Guided exercises and challenges to reinforce learning concepts"
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {showOpening && <OpeningAnimation onComplete={() => {
        setShowOpening(false);
        sessionStorage.setItem("hasVisited", "true");
      }} />}

      {!showOpening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between h-16 sm:h-20">
                <div className="flex items-center gap-3 sm:gap-6">
                  <Link to="/">
                    <SRMLogo />
                  </Link>
                  <div className="hidden md:flex items-center gap-4 border-l border-border pl-6">
                    <div className="flex flex-col">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">21AIC502J</p>
                      <p className="text-sm font-semibold text-foreground">Emerging AI Applications</p>
                    </div>
                  </div>
                </div>
                <nav className="flex items-center gap-2 sm:gap-4">
                  <Link to="/module/lab-1/dfs">
                    <Button size="sm" className="gap-2 shadow-sm">
                      <Beaker className="h-4 w-4" />
                      <span className="hidden sm:inline">Enter Labs</span>
                      <span className="sm:hidden">Labs</span>
                    </Button>
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-background to-background dark:from-blue-950/30 dark:via-background dark:to-background" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />

            <motion.div
              className="container mx-auto px-4 sm:px-6 text-center space-y-8"
              style={{ opacity, scale }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium border-primary/20 bg-primary/5 text-primary mb-6 hover:shadow-lg hover:shadow-primary/40 hover:bg-primary/10 transition-all duration-300 cursor-default">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Next-Gen Virtual Laboratory
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.1] mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Artificial Intelligence</span> Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Experimentation</span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Dive into interactive visualizations, real-world applications, and hands-on experiments designed to bridge the gap between theory and practice.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link to="/module/lab-1/dfs">
                  <Button size="lg" className="h-14 px-8 text-lg gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full">
                    Start Exploring <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-lg gap-2 rounded-full border-2"
                  onClick={() => {
                    const element = document.getElementById('syllabus');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <BookText className="h-5 w-5" /> View Syllabus
                </Button>
              </motion.div>

              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-12 opacity-80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                {[
                  { label: "Lab Modules", icon: "12" },
                  { label: "Course Units", icon: "05" },
                  { label: "Interactive Demos", icon: <Cpu className="w-6 h-6" /> },
                  { label: "Real-world Apps", icon: <Monitor className="w-6 h-6" /> },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="text-2xl font-bold text-primary flex items-center justify-center h-10">{stat.icon}</div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </section>

          {/* Labs Section with Staggered Grid */}
          <Section className="py-20 sm:py-32 bg-primary/10 relative">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <div className="container mx-auto px-4 sm:px-6 relative">
              <div className="text-center space-y-4 mb-16">
                <motion.div variants={itemVariants}>
                  <Badge variant="outline" className="px-4 py-1.5 border-primary/20">
                    <Beaker className="h-3.5 w-3.5 mr-2 text-primary" />
                    Laboratory Modules
                  </Badge>
                </motion.div>
                <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold">
                  Hands-On Learning
                </motion.h2>
                <motion.p variants={itemVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Explore our comprehensive suite of 12 laboratory modules, each designed to master specific AI concepts through practice.
                </motion.p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {MODULES.map((module) => {
                  const firstSubModule = module.subModules[0];
                  const isAvailable = firstSubModule?.implemented;

                  return (
                    <motion.div key={module.id} variants={itemVariants}>
                      <Link to={isAvailable ? `/module/${module.id}/${firstSubModule.id}` : '#'}>
                        <Card className={`h-full group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm ${!isAvailable && 'opacity-60 grayscale'}`}>
                          <CardHeader>
                            <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-xl ${isAvailable ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'} group-hover:scale-110 transition-transform duration-300`}>
                                <DynamicIcon name={module.icon} className="h-6 w-6" />
                              </div>
                              <Badge className={`text-xs font-normal ${isAvailable ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"}`}>
                                Lab {module.number}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
                              {module.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {module.description}
                            </p>
                            <div className={`flex items-center text-sm font-medium ${isAvailable ? 'text-primary' : 'text-muted-foreground'} group-hover:translate-x-1 transition-transform`}>
                              {isAvailable ? 'Start Lab' : 'Coming Soon'} <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* Features Section */}
          <Section className="py-20 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center space-y-4 mb-16">
                <motion.div variants={itemVariants}>
                  <Badge variant="outline" className="px-4 py-1.5">
                    <Monitor className="h-3.5 w-3.5 mr-2" />
                    Interactive Features
                  </Badge>
                </motion.div>
                <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold">
                  Learn by Doing
                </motion.h2>
                <motion.p variants={itemVariants} className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  Our platform provides multiple ways to engage with the content.
                </motion.p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {interactiveFeatures.map((feature, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="h-full border-none shadow-none bg-transparent text-center">
                      <CardHeader className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 group hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                          <feature.icon className="w-8 h-8 text-white transition-colors" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>

          {/* Syllabus Section (Updated UI) */}
          <Section id="syllabus" className="py-20 sm:py-32 bg-primary/10">
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
              <div className="text-center space-y-4 mb-12">
                <motion.div variants={itemVariants}>
                  <Badge variant="outline" className="px-4 py-1.5">
                    <BookText className="h-3.5 w-3.5 mr-2" />
                    Syllabus
                  </Badge>
                </motion.div>
                <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold">
                  Course Curriculum
                </motion.h2>
              </div>

              <div className="space-y-4">
                {SYLLABUS_UNITS.map((unit) => (
                  <motion.div key={unit.unit} variants={itemVariants}>
                    <Collapsible
                      open={openUnits.includes(unit.unit)}
                      onOpenChange={() => toggleUnit(unit.unit)}
                    >
                      <Card className={`overflow-hidden transition-all duration-300 ${openUnits.includes(unit.unit) ? 'border-primary shadow-md' : 'hover:border-primary/50'}`}>
                        <CollapsibleTrigger className="w-full text-left">
                          <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                {unit.unit}
                              </span>
                              <h3 className="text-lg font-semibold">{unit.title}</h3>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${openUnits.includes(unit.unit) ? 'rotate-180' : ''}`} />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-6 pb-6 pt-0 ml-12">
                            <ul className="space-y-3">
                              {unit.topics.map((topic, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                  <span>{topic}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>

          {/* Learning Outcomes & Footer can follow similar pattern or stay simpler */}
          <section className="py-20 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">What You Will Achieve</h2>
                <p className="text-muted-foreground">Key takeaways from this laboratory course</p>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {learningOutcomes.map((outcome, i) => (
                  <Card key={i} className="bg-card/50 backdrop-blur-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 border-border/50 group">
                    <CardContent className="p-6 flex flex-col gap-4">
                      <outcome.icon className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">{outcome.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 border-t border-border bg-background">
            <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 max-w-4xl mx-auto">
                {/* Left: Official SRM Logo */}
                <div className="flex flex-col items-center md:items-start gap-2">
                  <img
                    src={`${import.meta.env.BASE_URL}srm-official-logo.jpg`}
                    alt="SRM Institute of Science and Technology"
                    className="h-16 w-auto mix-blend-multiply dark:mix-blend-normal"
                  />
                  <div className="text-center md:text-left">
                    <p className="font-bold text-foreground">SRM Institute of Science and Technology</p>
                    <p className="text-xs">University</p>
                  </div>
                </div>

                {/* Right: SRM Virtual Lab Logo */}
                <div className="flex flex-col items-center md:items-end gap-2">
                  <img
                    src={`${import.meta.env.BASE_URL}srmvl-logo.png`}
                    alt="SRM Virtual Labs"
                    className="h-12 w-auto"
                  />
                  <div className="text-center md:text-right">
                    <p className="font-bold text-foreground">Department of Computational Intelligence</p>
                    <p className="text-xs">Virtual Laboratory</p>
                  </div>
                </div>
              </div>
              <p>© {new Date().getFullYear()} SRM Institute of Science and Technology. All rights reserved.</p>
            </div>
          </footer>
        </motion.div>
      )}
    </div>
  );
}
