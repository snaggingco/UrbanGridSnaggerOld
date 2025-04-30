import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  bgColor?: string;
}

export default function CTASection({
  title,
  subtitle,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  bgColor = 'bg-primary'
}: CTASectionProps) {
  return (
    <section className={`${bgColor} py-16 md:py-20`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">{title}</h2>
          <p className="text-xl text-white/80 mb-8">{subtitle}</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="rounded-full">
              <Link href={primaryButtonLink}>{primaryButtonText}</Link>
            </Button>
            
            {secondaryButtonText && secondaryButtonLink && (
              <Button asChild size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/10">
                <Link href={secondaryButtonLink}>{secondaryButtonText}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}