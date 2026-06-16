import RegistrationForm from "@/components/RegistrationForm";

import { PageHeader } from "@/components/PageHeader";

const RegistrationPage = () => {
  return (
    <>
      <PageHeader
        badgeText="Registration"
        title="Join the club"
        description=""
        buttonText="Go to login"
        buttonLink="/login"
      />

      <RegistrationForm />
    </>
  );
};

export default RegistrationPage;
