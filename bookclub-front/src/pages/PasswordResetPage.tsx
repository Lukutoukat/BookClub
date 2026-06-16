import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
const PasswordResetPage = () => {
  return (
    <>
      <PageHeader
        badgeText="password reset"
        title="Reset your password"
        description="Reset your passoword using the email attached to your account."
        buttonText="back to login"
        buttonLink="/login"
      />

      <Card className="card-base">
        <CardHeader className="card-header">
          <CardTitle className="text-xl sm:text-2xl">Password reset</CardTitle>
          <CardDescription className="text-sm sm:text-base"></CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6"></CardContent>
      </Card>
    </>
  );
};

export default PasswordResetPage;
