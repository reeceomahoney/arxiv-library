import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/app/components/ui/alert-dialog";

const WelcomePopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    if (!hasVisited) {
      setShowPopup(true);
      localStorage.setItem("hasVisitedBefore", "true");
    }
  }, []);

  return (
    <AlertDialog open={showPopup} onOpenChange={setShowPopup}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            Welcome to Arxiv Library!
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-base">
            <p>
              I created this web app to help student and researchers organize
              their reasearch papers.
            </p>
            <p>How to use:</p>
            <ul className="list-disc pl-6">
              <li>
                Paste any arxiv link into the add papers form to add it to your
                library
              </li>
              <li>Create folders to organise your library</li>
              <li>
                Use the search bar at the top to filter for particular papers
              </li>
            </ul>
            <p>
              If you have any feedback or suggestions, feel free to reach out to
              me at reeceo@robots.ox.ac.uk. Enjoy!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="w-full">Get Started</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WelcomePopup;
