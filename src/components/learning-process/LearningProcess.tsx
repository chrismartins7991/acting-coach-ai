import { motion } from "framer-motion";
import { LearningProcessStep } from "./LearningProcessStep";
import { steps } from "./learningProcessData";
import { useTranslation } from "react-i18next";

export const LearningProcess = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-gradient-to-br from-black to-theater-purple">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-white text-center mb-16"
        >
          {t("process.title")}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <LearningProcessStep
              key={index}
              {...step}
              title={t(step.titleKey)}
              description={t(step.descriptionKey)}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};