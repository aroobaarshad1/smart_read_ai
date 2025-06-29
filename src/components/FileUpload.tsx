"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Inbox, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { storage } from "../firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from "firebase/storage";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      pdfUrl,
      file_key,
      file_name,
    }: {
      pdfUrl: string;
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        pdf_url: pdfUrl, // ✅ match the backend key
        file_key,
        file_name,
      });

      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      const file_key = uuidv4().toString();
      const storageRef = ref(storage, `pdf/${file_key}_${file.name}`);

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot: UploadTaskSnapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // Optional: Add progress UI
          },
          (error) => {
            toast.error("Upload failed. Please try again.");
            setUploading(false);
          }
        );

        await uploadTask;

        const url = await getDownloadURL(
          ref(storage, `pdf/${file_key}_${file.name}`)
        );

        toast.success("File uploaded successfully!");

        if (!file.name || !file_key) {
          toast.error("Something went wrong in file upload");
          return;
        }

        mutate(
          { pdfUrl: url, file_key, file_name: file.name },
          {
            onSuccess: ({ chat_id }) => {
              toast.success("Chat created!");
              router.push(`/chat/${chat_id}`);
            },
            onError: (err) => {
              toast.error("Error creating chat");
              console.error("❌ Chat creation error:", err);
            },
          }
        );
      } catch (error) {
        toast.error("An error occurred. Please try again.");
        console.error("❌ Upload error:", error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
