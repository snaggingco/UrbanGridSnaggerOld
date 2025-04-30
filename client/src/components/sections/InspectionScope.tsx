import { useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { fadeIn } from "@/lib/animations";
import {
  Ruler, Zap, Paintbrush, Bath, Building, Thermometer,
  Square, Construction, Home, Fan, Hammer, Layers
} from "lucide-react";

const inspectionCategories = [
  {
    title: "Plastering & drylining",
    icon: Construction,
    items: [
      "Wall Levels within tolerances",
      "Plaster-boarding & joints",
      "Large cracks & overuse of fillers",
      "Smoothness, finish line & grouting"
    ]
  },
  {
    title: "Electrical systems",
    icon: Zap,
    items: [
      "Correct circuit protection devices",
      "Correct earthing arrangements",
      "Socket polarity check",
      "Zoning compliance checks"
    ]
  },
  {
    title: "Painting & decorating",
    icon: Paintbrush,
    items: [
      "Drips, runs & brush marks",
      "Missing & thin painted areas",
      "Overpainting switches / brassware",
      "General poor craftsmanship"
    ]
  },
  {
    title: "Bathrooms & kitchens",
    icon: Bath,
    items: [
      "Worktops & surfaces inspected",
      "Brown / white goods inspected",
      "Cupboard & door alignment",
      "Sanitary-ware, shower & screens"
    ]
  },
  {
    title: "External works",
    icon: Building,
    items: [
      "Bricks, mortar & masonry checked",
      "Application of sealants checked",
      "Brick perpend verticals for square",
      "Stone sills Checked for damage"
    ]
  },
  {
    title: "AC & plumbing",
    icon: Thermometer,
    items: [
      "Boiler flue inspection",
      "Radiators & heating pipework",
      "Hot / cold / mains pipework",
      "Bath & shower room installation"
    ]
  },
  {
    title: "Windows & doors",
    icon: Square,
    items: [
      "Scratched glass & faulty seals",
      "Misaligned window & doors",
      "Fire escape window suitability",
      "Window trickle vent effectiveness"
    ]
  },
  {
    title: "Level tolerances",
    icon: Ruler,
    items: [
      "Wall/ceiling/floor levels checked",
      "Wall & Floor Tile Levels Checked",
      "Window & Door Levels Checked",
      "Not square to eye levels checked"
    ]
  },
  {
    title: "Driveway & garden",
    icon: Home,
    items: [
      "Drainage & water run-off",
      "Manhole location",
      "Damp course position/breach",
      "Driveway, paths & patio surfaces"
    ]
  },
  {
    title: "Fans & ventilation",
    icon: Fan,
    items: [
      "Cooker extractor flow rates",
      "Bathroom extractor flow rates",
      "All bathroom overrun times",
      "AC temperature & airflow"
    ]
  },
  {
    title: "Carpentry & stairs",
    icon: Hammer,
    items: [
      "Skirting / architrave joinery",
      "Hinge & handle fitment check",
      "Handrail, newel & baluster",
      "Tread & riser conformity"
    ]
  },
  {
    title: "Floors & coverings",
    icon: Layers,
    items: [
      "Vinyl floor damage & fitment",
      "Carpet stains, damage & fitment",
      "Wood / laminate marks & fitment",
      "Floor tiles damage & fitment"
    ]
  }
];

export default function InspectionScope() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">What We Inspect</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We make sure everything is perfect with our comprehensive inspection covering all aspects of your property
          </p>
        </motion.div>

        <div 
          ref={scrollRef}
          className="relative h-[600px] overflow-hidden"
        >
          <div className="h-full overflow-y-auto pr-4" style={{ scrollbarWidth: 'thin' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
              {inspectionCategories.map((category, index) => (
                <Card 
                  key={`${category.title}-${index}`}
                  className="bg-white transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <category.icon className="h-8 w-8 text-primary" />
                      <h3 className="text-xl font-semibold">{category.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {category.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-primary">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Subtle top and bottom shadows for scroll indication */}
          <div className="absolute top-0 left-0 right-4 h-8 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-4 h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
}