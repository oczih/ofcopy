'use client';

import { FC } from 'react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

const FeaturesSection: FC<FeaturesSectionProps> = ({ features }) => {
  return (
    <section className="px-12 py-50 bg-[#151515]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl max-w-2xl p-10 border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-5 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
