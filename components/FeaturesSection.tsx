'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';

const featureVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: 'easeIn' },
  }),
};

export default function FeaturesSection({ features }) {
  return (
    <section className="px-12 py-100 bg-[#151515]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-3xl max-w-2xl p-10 border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300"
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={index}
            >
              <div className="flex items-center gap-5 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
