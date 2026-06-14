import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";

const defaultSteps = [
  "Loading logs",
  "Extracting entities",
  "Correlating events",
  "Investigating activity",
  "Checking evidence",
  "Mapping MITRE techniques",
  "Generating report"
];

export default function ProgressModal({ open, title = "Running Investigation", steps = defaultSteps, onComplete }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveStep((step) => {
        if (step >= steps.length - 1) {
          window.clearInterval(timer);
          window.setTimeout(() => onComplete?.(), 350);
          return step;
        }
        return step + 1;
      });
    }, 420);

    return () => window.clearInterval(timer);
  }, [open, onComplete, steps.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-lg backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-primary/20 bg-surface-container-low p-lg shadow-soft-purple">
        <div className="mb-lg flex items-center gap-md">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary-container/30 text-primary">
            <Icon name="progress_activity" className="animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">{title}</h3>
            <p className="text-sm text-on-surface-variant">Rule-based investigation pipeline is processing evidence.</p>
          </div>
        </div>

        <div className="space-y-sm">
          {steps.map((step, index) => {
            const done = index < activeStep;
            const active = index === activeStep;
            return (
              <div key={step} className="flex items-center gap-sm rounded border border-outline-variant/40 bg-surface-container-high/60 p-sm">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-[12px] ${
                    done ? "bg-success text-black" : active ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {done ? <Icon name="check" className="text-[16px]" /> : index + 1}
                </span>
                <span className={active ? "text-primary" : "text-on-surface-variant"}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
