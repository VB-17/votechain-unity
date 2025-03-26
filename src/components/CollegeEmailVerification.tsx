
import React, { useState } from "react";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address").refine(
    (email) => email.toLowerCase().endsWith('.edu'),
    {
      message: "Please use a college email ending with .edu",
    }
  ),
});

type EmailFormValues = z.infer<typeof emailSchema>;

const CollegeEmailVerification: React.FC = () => {
  const { profile, verifyCollegeEmail } = useSupabaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: profile?.college_email || "",
    },
  });

  const onSubmit = async (values: EmailFormValues) => {
    setIsSubmitting(true);
    try {
      await verifyCollegeEmail(values.email);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profile?.college_verified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>College Email Verified</CardTitle>
          <CardDescription>
            Your college email has been verified successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-950 p-3 rounded-md border border-green-200 dark:border-green-800">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <p className="text-sm text-green-700 dark:text-green-300">
              {profile.college_email}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify College Email</CardTitle>
        <CardDescription>
          Add your college email to get verified for institutional elections.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College Email</FormLabel>
                  <FormControl>
                    <Input placeholder="youremail@college.edu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CollegeEmailVerification;
