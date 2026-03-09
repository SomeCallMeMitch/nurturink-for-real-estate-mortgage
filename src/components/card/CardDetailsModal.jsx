import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CardPreview from "@/components/preview/CardPreviewNew";
import { Separator } from "@/components/ui/separator";

export default function CardDetailsModal({
  open,
  onOpenChange,
  cardDesign,
  message,
  client,
  user,
  organization,
  noteStyleProfile,
  previewSettings,
  includeGreeting = true,
  includeSignature = true,
}) {
  if (!cardDesign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold">{cardDesign.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-8 pb-8">
            {/* Top Row: Outside Design + Physical Views Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Outside Design (Cover) */}
              <div className="space-y-3 h-full flex flex-col">
                <h3 className="text-lg font-semibold border-b pb-2">Outside Design</h3>
                <div className="flex-1 flex justify-center items-center bg-muted/30 p-6 rounded-lg">
                  <img
                    src={cardDesign.outsideImageUrl || cardDesign.imageUrl}
                    alt="Card Cover"
                    className="max-h-[600px] w-auto shadow-lg rounded-sm object-contain"
                  />
                </div>
              </div>

              {/* Right Column: Physical Card View (Front & Back) */}
              {(cardDesign.frontImageUrl || cardDesign.backImageUrl) && (
                <div className="space-y-3 h-full flex flex-col">
                  <h3 className="text-lg font-semibold border-b pb-2">Physical Card View</h3>
                  <div className="flex-1 grid grid-cols-2 gap-6 bg-muted/30 p-6 rounded-lg items-center">
                    {cardDesign.frontImageUrl && (
                      <div className="space-y-2 text-center">
                        <span className="text-sm font-medium text-muted-foreground">Front</span>
                        <img
                          src={cardDesign.frontImageUrl}
                          alt="Physical Card Front"
                          className="w-full h-auto shadow-lg rounded-sm"
                        />
                      </div>
                    )}
                    {cardDesign.backImageUrl && (
                      <div className="space-y-2 text-center">
                        <span className="text-sm font-medium text-muted-foreground">Back</span>
                        <img
                          src={cardDesign.backImageUrl}
                          alt="Physical Card Back"
                          className="w-full h-auto shadow-lg rounded-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: Inside Preview with Message */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">Inside Preview with Message</h3>
              <p className="text-sm text-muted-foreground">
                This is how the inside of the card will look with your current message and handwriting style.
              </p>
              <div className="flex justify-center bg-muted/30 p-6 rounded-lg">
                <div className="w-full max-w-[440px]">
                  <CardPreview
                    message={message}
                    client={client}
                    user={user}
                    organization={organization}
                    noteStyleProfile={noteStyleProfile}
                    selectedDesign={cardDesign}
                    previewSettings={previewSettings}
                    includeGreeting={includeGreeting}
                    includeSignature={includeSignature}
                    randomIndentEnabled={true}
                    showLineCounter={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-2 border-t">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}