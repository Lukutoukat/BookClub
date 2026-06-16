import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import { Button } from './ui/button';

type errorMessageProps = {
  message: string;
  remove: () => void;
};
const errorMessageDisplay = ({ message, remove }: errorMessageProps) => {
  if (!message) {
    return null;
  }
  return (
    <>
      <Alert variant="destructive" className="max-w-full">
        <AlertCircleIcon />
        <AlertTitle> Error: </AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        <AlertAction>
          <Button size="xs" variant="default" onClick={remove}>
            Close
          </Button>
        </AlertAction>
      </Alert>
    </>
  );
};

export default errorMessageDisplay;
