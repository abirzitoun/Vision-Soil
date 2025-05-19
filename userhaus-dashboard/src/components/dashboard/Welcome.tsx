
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function Welcome() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-block">
            <span className="px-3 py-1 text-xs font-medium bg-soil-200 text-soil-700 rounded-full">
              Dashboard
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-soil-900">
            {greeting}, Admin
          </h1>
          <p className="mt-1 text-sm text-soil-600">
            Here's what's happening with your farms today.
          </p>
        </div>
        <Link
          to="/farms"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-soil-700 bg-soil-100 rounded-lg hover:bg-soil-200 transition-colors"
        >
          Manage Farms
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

