import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ProfileFormData } from "../../../schemas";

interface PersonalInformationSectionProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
}

const PersonalInformationSection: React.FC<PersonalInformationSectionProps> = ({
  register,
  errors,
}) => {
  return (
    <section className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <textarea
            {...register("summary")}
            
            placeholder="Full Name"
            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
          />
          {errors.personal?.name && (
            <p className="text-red-500 text-sm mt-1">{errors.personal.name.message}</p>
          )}
        </div>
       
      </div>
    </section>
  );
};

export default PersonalInformationSection ;