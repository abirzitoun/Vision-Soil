
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserPlus, ArrowRight, ArrowLeft, Check, Phone, Mail, User } from "lucide-react";

// Removed the non-existent 'Farm' icon from lucide-react

interface AddFarmerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddFarmerDialog = ({ open, onOpenChange }: AddFarmerDialogProps) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "farmer" // Default role
  });

  const steps = [
    "Personal Information",
    "Contact Details",
    "Account Setup",
    "Review & Submit"
  ];

  const handleNext = () => {
    if (step === 0) {
      if (!formData.firstName || !formData.lastName) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (step === 1) {
      if (!formData.email || !formData.phoneNumber) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    } else if (step === 2) {
      if (!formData.password || !formData.confirmPassword) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:8081/api/engineer/add/farmers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorMessage = await response.json();
        toast.error(errorMessage.message || "Failed to create farmer");
        return;
      }
  
      const newFarmer = await response.json();
      console.log("Farmer created:", newFarmer);
  
      toast.success("Farmer created successfully!");
      onOpenChange(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        role: "farmer",
      });
      setStep(0);
    } catch (error) {
      console.error("Error creating farmer:", error);
      toast.error("Failed to create farmer");
    }
  };
  

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-soil-700">
                First Name
              </label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-soil-700">
                Last Name
              </label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-soil-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-soil-700">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-soil-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-soil-700">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                required
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-soil-800">Review Information</h3>
            <div className="bg-soil-50 p-4 rounded-md space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-soil-600">First Name</p>
                  <p className="font-medium">{formData.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-soil-600">Last Name</p>
                  <p className="font-medium">{formData.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-soil-600">Email</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-soil-600">Phone</p>
                  <p className="font-medium">{formData.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-soil-800 flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Farmer
          </DialogTitle>
          <DialogDescription className="text-soil-600">
            {steps[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <div className="flex gap-2 mb-6">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`h-1 flex-1 rounded-full ${
                  index <= step ? "bg-soil-600" : "bg-soil-200"
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {renderStepContent()}

            <div className="flex justify-between pt-4 mt-4 border-t border-soil-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 0}
                className="bg-soil-100 hover:bg-soil-200 text-soil-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              {step < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-soil-600 hover:bg-soil-700 text-white"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-soil-600 hover:bg-soil-700 text-white"
                >
                  Submit
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};