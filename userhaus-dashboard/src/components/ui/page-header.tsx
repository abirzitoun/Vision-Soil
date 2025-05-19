import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-6 gap-4">
      <div>
        <motion.h1 
          className="text-2xl font-medium text-soil-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p 
            className="text-soil-600 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {description}
          </motion.p>
        )}
      </div>
      {children && (
        <motion.div
          className="flex flex-col items-center" // Assure un alignement vertical centré
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
