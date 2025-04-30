import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default function QuickResponseForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Use the same form schema as the inquiry form
  const form = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "Quick response inquiry",
      propertyType: "apartment",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertInquiry) => {
      try {
        // Use correct parameters for apiRequest: endpoint, options object with method and stringified body
        return await apiRequest<any>("/api/inquiries", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Quick response form submission error:", error);
        throw new Error('Network error. Please check your connection and try again.');
      }
    },
    onSuccess: () => {
      toast({
        title: t('forms.success_title'),
        description: t('forms.success_message'),
      });
      form.reset();
      setIsSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: t('forms.error_title'),
        description: error.message || t('forms.error_message'),
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: InsertInquiry) {
    mutation.mutate(data);
  }

  const propertyTypes = [
    { value: "apartment", label: t('forms.property_types.apartment') },
    { value: "villa", label: t('forms.property_types.villa') },
    { value: "townhouse", label: t('forms.property_types.townhouse') },
    { value: "commercial", label: t('forms.property_types.commercial') },
    { value: "other", label: t('forms.property_types.other') },
  ];

  return (
    <motion.section 
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="py-9 bg-gray-50" // Reduced padding by 25% (from py-12 to py-9)
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-6"> {/* Reduced margin by 25% (from mb-8 to mb-6) */}
          <h2 className="text-xl font-medium uppercase tracking-wider"> {/* Reduced font size by 25% (from 2xl to xl) */}
            {t('forms.quick_response_title')}
          </h2>
        </div>

        {isSubmitted ? (
          <div className="text-center p-6 bg-white rounded-lg shadow-sm"> {/* Reduced padding by 25% (from p-8 to p-6) */}
            <h3 className="text-lg font-medium text-primary mb-1.5"> {/* Reduced font size and margin by 25% */}
              {t('forms.thank_you')}
            </h3>
            <p className="text-gray-600 text-sm"> {/* Added text-sm to reduce font size */}
              {t('forms.we_will_contact')}
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)}
              className="bg-white p-4 md:p-6 rounded-lg shadow-sm" /* Reduced padding by 25% */
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3"> {/* Reduced gap by 25% (from gap-4 to gap-3) */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder={t('forms.name')} 
                          {...field} 
                          className="h-9 text-sm" /* Reduced height by 25% and added text-sm */
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PhoneInput
                          country={'ae'}
                          value={field.value}
                          onChange={field.onChange}
                          inputClass="!w-full !h-9 !text-sm" /* Reduced height and font size */
                          containerClass="!w-full"
                          placeholder={t('forms.phone')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder={t('forms.email')} 
                          type="email" 
                          {...field} 
                          className="h-9 text-sm" /* Reduced height by 25% and added text-sm */
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-sm"> {/* Reduced height by 25% and added text-sm */}
                            <SelectValue placeholder={t('forms.property_type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="text-sm"> {/* Added text-sm for consistent font sizing */}
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className="md:col-span-4">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto md:px-9 h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm" /* Reduced height, padding and font size */
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? t('forms.sending') : t('forms.send')}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </div>
    </motion.section>
  );
}