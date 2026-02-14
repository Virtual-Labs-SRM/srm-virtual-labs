import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  GraduationCap,
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
  BookText
} from 'lucide-react';
import { useState } from 'react';

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
        src="/logo.png"
        alt="SRM Logo"
        className={`object-contain ${imgClassName}`}
      />
    </div>
    {!hideText && (
      <div className="flex flex-col leading-tight pt-0.5">
        <span className={`font-bold text-blue-800 tracking-tight ${titleClassName}`}>SRM</span>
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

export default function Landing() {
  const [openUnits, setOpenUnits] = useState<number[]>([1]);

  const toggleUnit = (unit: number) => {
    setOpenUnits(prev =>
      prev.includes(unit)
        ? prev.filter(u => u !== unit)
        : [...prev, unit]
    );
  };

  const implementedCount = MODULES.reduce(
    (acc, m) => acc + m.subModules.filter(sm => sm.implemented).length,
    0
  );
  const totalCount = MODULES.reduce((acc, m) => acc + m.subModules.length, 0);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-6">
              <SRMLogo />
              <div className="hidden md:flex items-center gap-4 border-l border-border pl-6">
                <img src="/srm-official-logo.jpg" alt="SRM Institute of Science and Technology" className="h-10 sm:h-12 object-contain" />
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">21AIC502J</p>
                  <p className="text-sm font-semibold text-foreground">Emerging AI Applications</p>
                </div>
              </div>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4">

              <Link to="/module/lab-1/dfs">
                <Button size="sm" className="gap-1 sm:gap-2">
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
      <section className="gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-4 py-1.5 text-sm font-medium">
              21AIC502J • Virtual Laboratory
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Emerging Artificial Intelligence
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">Applications</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              An interactive laboratory course exploring real-world applications of
              Artificial Intelligence through hands-on visualization and experimentation
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/module/lab-1/dfs">
                <Button size="lg" className="gap-2 w-full sm:w-auto text-base px-8 bg-white text-primary hover:bg-white/90">
                  Explore Labs
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#syllabus">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto text-base px-8 border-white/50 bg-white/10 text-white hover:bg-white/20">
                  <BookText className="h-5 w-5" />
                  View Syllabus
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                <span>12 Lab Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                <span>5 Course Units</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                <span>Interactive Demos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Course */}
      <section id="about" className="py-12 sm:py-16 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-10">
              <Badge variant="outline" className="px-3 py-1">
                <BookOpen className="h-3 w-3 mr-1" />
                About the Course
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Course Overview
              </h2>
            </div>
            <Card className="bg-card border-border">
              <CardContent className="p-6 sm:p-8">
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                  This laboratory course provides hands-on experience with cutting-edge Artificial Intelligence
                  applications. Students will explore and implement various AI algorithms including search strategies
                  (DFS, BFS, A*), optimization techniques (Hill Climbing), fuzzy logic systems, machine learning
                  models, natural language processing, and ontology-based systems. Through interactive visualizations
                  and practical exercises, students develop proficiency in applying AI solutions to real-world problems
                  such as house price prediction, heart disease diagnosis, plagiarism detection, and expert matching systems.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Unit-Wise Syllabus */}
      <section id="syllabus" className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-10">
              <Badge variant="outline" className="px-3 py-1">
                <BookText className="h-3 w-3 mr-1" />
                Course Content
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Unit-Wise Syllabus Overview
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Click on each unit to explore the topics covered
              </p>
            </div>

            <div className="space-y-4">
              {SYLLABUS_UNITS.map((unit) => (
                <Collapsible
                  key={unit.unit}
                  open={openUnits.includes(unit.unit)}
                  onOpenChange={() => toggleUnit(unit.unit)}
                >
                  <Card className={`transition-all duration-200 ${openUnits.includes(unit.unit) ? 'border-primary/50 shadow-md' : 'hover:border-primary/30'}`}>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                              {unit.unit}
                            </div>
                            <div className="text-left">
                              <p className="text-xs text-muted-foreground font-medium">Unit {unit.unit}</p>
                              <CardTitle className="text-lg">{unit.title}</CardTitle>
                            </div>
                          </div>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${openUnits.includes(unit.unit) ? 'rotate-180' : ''}`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4">
                        <ul className="space-y-2 ml-14">
                          {unit.topics.map((topic, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Laboratory Modules */}
      <section id="labs" className="py-12 sm:py-16 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-10">
            <Badge variant="outline" className="px-3 py-1">
              <Beaker className="h-3 w-3 mr-1" />
              Laboratory Modules
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Explore All 12 Labs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each lab includes theory, algorithms, code implementations, interactive demos, and practice exercises
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {MODULES.map((module) => {
              const firstSubModule = module.subModules[0];
              const isAvailable = firstSubModule?.implemented;

              return (
                <Card
                  key={module.id}
                  className={`group transition-all duration-300 hover:shadow-lg hover:border-primary/30 ${isAvailable ? 'cursor-pointer' : 'opacity-70'
                    }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-2.5 rounded-lg ${isAvailable ? 'bg-primary/10' : 'bg-muted'}`}>
                        <DynamicIcon
                          name={module.icon}
                          className={`h-5 w-5 ${isAvailable ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                      </div>
                      <Badge variant={isAvailable ? 'default' : 'secondary'} className="text-xs">
                        Lab {module.number}
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-tight">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2 mt-1">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isAvailable && firstSubModule ? (
                      <Link to={`/module/${module.id}/${firstSubModule.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          View Lab
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Outcomes */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-10">
            <Badge variant="outline" className="px-3 py-1">
              <Target className="h-3 w-3 mr-1" />
              Learning Outcomes
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Skills You'll Gain
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upon completion of this course, students will be able to:
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
            {learningOutcomes.map((outcome, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <outcome.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-foreground text-sm sm:text-base leading-relaxed">
                  {outcome.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Learning Features */}
      <section className="py-12 sm:py-16 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-10">
            <Badge variant="outline" className="px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Interactive Learning
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              How You'll Learn
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Engage with AI concepts through multiple interactive modalities
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {interactiveFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-border">
                <CardHeader>
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Ready to Begin Your AI Journey?
            </h2>
            <p className="text-muted-foreground text-lg mb-4">
              Start exploring the 12 comprehensive laboratory modules and develop practical AI skills
            </p>
            <Link to="/module/lab-1/dfs" className="inline-block mt-4">
              <Button size="lg" className="gradient-primary text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 gap-2 text-base px-10 h-14">
                Start Labs
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 w-full max-w-5xl mx-auto py-4">
              <div className="flex-1 flex justify-center px-4">
                <SRMLogo
                  imgClassName="w-20 h-20 sm:w-36 sm:h-36"
                  titleClassName="sm:text-4xl"
                  subtitleClassName="sm:text-xl"
                  gapClassName="gap-6"
                />
              </div>

              <div className="hidden sm:block w-[1.5px] h-24 bg-border shrink-0" />

              <div className="flex-1 flex justify-center px-4">
                <img src="/srm-official-logo.jpg" alt="SRM Institute of Science and Technology" className="h-16 sm:h-24 object-contain" />
              </div>

              <div className="hidden sm:block w-[1.5px] h-24 bg-border shrink-0" />

              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left px-8">
                <p className="text-base sm:text-lg font-bold text-foreground leading-tight">Department of Computational Intelligence</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium text-primary">21AIC502J</p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Emerging Artificial Intelligence Applications</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">21AIC502J</span> — Emerging Artificial Intelligence Applications
              </p>
              <p className="text-sm text-muted-foreground">
                Virtual Laboratory for Academic Use
              </p>
            </div>

            <div className="pt-4 border-t border-border w-full max-w-md">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} SRM Institute of Science and Technology.
                This virtual laboratory is intended for educational purposes only.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
