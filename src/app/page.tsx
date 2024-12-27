/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// all the above are disabled because i don't have the interface for the actual course from the api
// and don't wanna spend my time transcribing all that
"use client";

import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

export default function CourseFormPage() {
  const [networkError, setNetworkError] = useState("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [courseName, setCourseName] = useState<string>(""); // not a part of interface UpsertCourse
  const [showNetworkError, setShowNetworkError] = useState<boolean>(false);
  const [submissionStatus, setsubmissionStatus] = useState<string>("");

  const initialState: UpsertCourse = {
    id: "",
    number: 0,
    abbreviation: "",
    color: "",
    image: "",
    disclaimer: "",
    studyModes: [],
    flags: {
      published: false,
    },
  };

  const [upsertCourse, setUpsertCourse] = useState<UpsertCourse>(initialState);

  // Future TODO: componentize the preview component
  // TODO: id generation

  interface UpsertCourse {
    id?: string;
    number: number;
    abbreviation: string;
    color?: string;
    image: string; // String of the image URL to display as the course icon
    disclaimer?: string | undefined;
    studyModes: StudyMode[];
    flags: {
      published: boolean;
    };
  }

  type StudyMode = "EXAM" | "TOPIC" | "TIMED_EXAM";

  const darkenColor = (hex: string | undefined, factor: number): string => {
    const defaultColor = "#000000";

    if (!hex) {
      return defaultColor;
    }

    const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;

    if (!/^[A-Fa-f0-9]{6}$/.exec(cleanHex)) {
      return defaultColor;
    }

    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);

    const darkenedR = Math.max(0, Math.round(r * factor));
    const darkenedG = Math.max(0, Math.round(g * factor));
    const darkenedB = Math.max(0, Math.round(b * factor));

    return `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;
  };

  const handlePreview = () => {
    if (showPreview === false && upsertCourse.image !== "") {
      setShowPreview(true);
    } else if (showPreview === true) {
      setShowPreview(false);
    }
  };

  const handleReset = () => {
    setUpsertCourse({
      id: "",
      number: 0,
      abbreviation: "",
      color: "",
      image: "",
      disclaimer: "",
      studyModes: [],
      flags: {
        published: false,
      },
    });

    setShowPreview(false);
    setNetworkError("");
    setShowNetworkError(false);
    setCourseName("");
  };

  const handleSubmit = async () => {
    let id: string | undefined = "";

    // if the disclaimer block is empty, it sets it to undefined
    // before sending it to the API
    if (upsertCourse.disclaimer === "") {
      setUpsertCourse((prev: UpsertCourse) => ({
        ...prev,
        disclaimer: undefined,
      }));
    }

    // check if any field that needs to be filled is left blank
    if (
      upsertCourse.number === 0 ||
      upsertCourse.abbreviation === "" ||
      upsertCourse.color === "" ||
      upsertCourse.image === "" ||
      upsertCourse.studyModes.length === 0
    ) {
      setsubmissionStatus("One or more fields is blank, please try again");
    } else {
      // the field isn't blank, so set a useState to a value to show a
      // success message to the User
      setsubmissionStatus("Success!");

      const fetchString =
        "https://api.boilerexams.com/courses/" +
        upsertCourse.abbreviation.toUpperCase() +
        upsertCourse.number;

      // sus code block

      if (upsertCourse.abbreviation === "" || !upsertCourse.abbreviation) {
        id = "";
      } else {
        // send a get request to check if the id already exists in the api,
        // if it does use the same id, else create a new id of a similar format
        // to what the API already uses
        try {
          let response: any = ""; // I don't have the interface for what the API actually uses, so any should suffice for now

          response = await fetch(fetchString).then((response) => {
            if (!response.ok) {
              setNetworkError("Please select a valid subject.");
              setShowNetworkError(true);
            }
            return response.json();
          });

          if (response === "" || response.course) {
            id = "";
          } else if (response.message) {
            id = "";
          } else {
            const currentCourse: UpsertCourse = response as UpsertCourse;
            id = currentCourse.id;
          }
        } catch (error) {
          id = "";
          console.log("Error occurred: " + String(error));
        }
      }

      if (id === "") {
        id = crypto.randomUUID();
        console.log(id);
        setUpsertCourse((prev: UpsertCourse) => ({
          ...prev,
          id: id,
        }));
      }

      // sus code block

      try {
        const consoleUpsertCourse: UpsertCourse = upsertCourse;
        console.log(consoleUpsertCourse);

        const response = await fetch(fetchString, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(upsertCourse),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Success:", result);
      } catch (error) {
        console.log("Error:", error);
      }

      handleReset();
    }
  };

  const renderImage = () => {
    try {
      if (showPreview && upsertCourse.image) {
        return (
          <div className="mt-[20px] flex w-full justify-center">
            <Image
              src={upsertCourse.image}
              width={200}
              height={200}
              alt={
                upsertCourse.abbreviation +
                " " +
                upsertCourse.number +
                " preview image"
              }
              unoptimized // this is necessary to allow all hosts to work, if you decide to just preview an image
              // not good production code necessarily
            />
          </div>
        );
      }
    } catch (error) {
      console.error("Error rendering image:", error);
      // Optionally, render a fallback UI or return null
      return (
        <div className="mt-[20px] flex w-full justify-center">
          <p>Error loading preview image</p>
        </div>
      );
    }
    return null; // Return null if conditions are not met
  };

  const handleRetrieval = async () => {
    try {
      // any is the interface defining all properties of
      // the course including statistics, it's unecessary
      // to type out the entire interface so you get
      // the point

      const upsertCourseString: string = upsertCourse.number.toLocaleString();
      let fetchString: string;

      if (
        upsertCourseString.length === 3 &&
        !upsertCourseString.includes("00")
      ) {
        setUpsertCourse((prev: UpsertCourse) => ({
          ...prev,
          number: upsertCourse.number * 100,
        }));

        fetchString =
          "https://api.boilerexams.com/courses/" +
          upsertCourse.abbreviation.toUpperCase() +
          upsertCourse.number * 100;
      } else {
        fetchString =
          "https://api.boilerexams.com/courses/" +
          upsertCourse.abbreviation.toUpperCase() +
          upsertCourse.number;
      }

      let response: any = "";

      if (upsertCourse.abbreviation === "" || !upsertCourse.abbreviation) {
        setNetworkError("Please select a valid subject.");
        setShowNetworkError(true);
        return;
      }

      if (fetchString === "https://api.boilerexams.com/courses/") {
        setNetworkError("That Course does not exist.");
        setShowNetworkError(true);
      } else {
        response = await fetch(fetchString).then((response) => {
          if (!response.ok) {
            setNetworkError("Please select a valid subject.");
            setShowNetworkError(true);
          }
          return response.json();
        });
      }

      if (response === "" || response.course) {
        setNetworkError("That Course does not exist.");
        setShowNetworkError(true);
      } else if (response.message) {
        setNetworkError("That Course does not exist.");
        setShowNetworkError(true);
      } else {
        const currentCourse: UpsertCourse = response as UpsertCourse;
        setCourseName(response.name);

        setUpsertCourse({
          ...upsertCourse, // abbreviation values might differ?
          id: currentCourse.id,
          number: currentCourse.number,
          // abbreviation: currentCourse.abbreviation,
          color: currentCourse.color,
          // image isn't available on the incoming
          image: response.resources[0].data.url,
          disclaimer: currentCourse.disclaimer,
          studyModes: currentCourse.studyModes,
          flags: {
            published: currentCourse.flags.published,
          },
        });
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    const checked =
      e.target instanceof HTMLInputElement &&
      (type === "checkbox" || type === "radio")
        ? e.target.checked
        : undefined;

    setUpsertCourse((prev) => {
      // Handle studyModes array
      if (name === "studyModes") {
        const mode = (e.target as HTMLInputElement).dataset.mode as StudyMode;
        if (checked) {
          return {
            ...prev,
            studyModes: [...prev.studyModes, mode],
          };
        } else {
          return {
            ...prev,
            studyModes: prev.studyModes.filter((m) => m !== mode),
          };
        }
      }

      // handles nested properties
      if (name.includes(".")) {
        const [parent, child] = name.split(".") as [keyof UpsertCourse, string];

        // Ensure parent is a valid nested object in UpsertCourse
        if (prev[parent] && typeof prev[parent] === "object") {
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: type === "checkbox" ? checked : value,
            },
          };
        }
      }

      // handle not-nested properties?
      return {
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
              ? Number(value)
              : value,
      } as UpsertCourse;
    });
  };

  return (
    <div className="flex w-screen overflow-x-hidden bg-[#343A3F] font-rubik text-white lg:h-screen lg:overflow-hidden">
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="pointer-events-none absolute inset-0 z-[1] h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 flex h-[4.5rem] w-full items-center bg-[#CFBA92] px-4">
        <Image
          src="/download-3.png"
          width={210.4}
          height={1116}
          alt="Boilerexams Logo"
        />
      </div>
      <div className="w-full lg:flex">
        <div className="relative py-[4.5rem] lg:w-1/2 lg:border-r-[2px] lg:border-dotted lg:border-r-gray-600">
          <h1 className="absolute top-24 w-full text-center text-[36px] font-semibold text-white">
            Edit Course Module
          </h1>
          <div className="flex h-full w-full items-center justify-center">
            <div className="mt-[120px] flex h-[800px] items-center overflow-y-auto rounded-md border-[4px] border-solid border-white bg-[#5D6166] px-8 py-10">
              <form className="z-[20]">
                <div className="flex">
                  <div>
                    <h1 className="font-semibold">Course subject</h1>
                    <select
                      name="abbreviation"
                      id="abbreviation"
                      className="mt-[8px] h-[24px] w-full border-2 border-solid border-white bg-[#343A3F] px-[4px] focus:outline-none"
                      onChange={handleChange}
                      value={upsertCourse.abbreviation}
                    >
                      <option value="">Pick A Subject</option>
                      <option value="ma">MA - Mathematics</option>
                      <option value="cs">CS - Computer Sciences</option>
                      <option value="aae">
                        AAE - Aero & Astro Engineering
                      </option>
                      <option value="ece">
                        ECE - Electrical & Computer Engr
                      </option>
                      <option value="biol">BIOL - Biological Sciences</option>
                      <option value="chm">CHM - Chemistry</option>
                      <option value="econ">ECON - Economics</option>
                      <option value="phys">PHYS - Physics </option>
                      <option value="stat">STAT - Statistics</option>
                    </select>
                  </div>
                  <div className="ml-[20px]">
                    <h1 className="font-semibold">Course number</h1>
                    <input
                      type="text"
                      name="number"
                      id="number"
                      value={upsertCourse.number}
                      className="mt-[8px] h-[24px] w-full border-2 border-solid border-white bg-[#343A3F] px-[4px] focus:outline-none"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-[20px]">
                  <a
                    type="button"
                    className="mr-[16px] border-[1px] border-solid border-white px-[8px] py-[2px] text-[16px] font-semibold"
                    onClick={handleRetrieval}
                  >
                    Retrieve Current State
                  </a>

                  {showNetworkError === true && (
                    <h1 className="mt-[12px] font-semibold text-[#cc3300]">
                      {networkError}{" "}
                      <button
                        className="underline"
                        onClick={() => {
                          setShowNetworkError((prev) => !prev);
                        }}
                      >
                        {" "}
                        Click here to dismiss
                      </button>
                    </h1>
                  )}
                </div>

                <div className="mt-[20px]">
                  <h1 className="font-semibold">Disclaimer</h1>
                  <textarea
                    name="disclaimer"
                    id="disclaimer"
                    rows={4}
                    cols={50}
                    className="mt-[8px] w-full border-2 border-solid border-white bg-[#343A3F] px-[4px] focus:outline-none"
                    onChange={handleChange}
                    value={upsertCourse.disclaimer}
                  ></textarea>
                </div>

                <div className="mt-[20px]">
                  <h1 className="font-semibold">Color Picker</h1>
                  <div className="flex items-center">
                    <input
                      type="color"
                      name="color"
                      className="mt-[12px]"
                      onChange={handleChange}
                      value={upsertCourse.color}
                    />
                    <div className="mx-[12px] mt-[12px]">(or)</div>
                    <input
                      type="text"
                      name="color"
                      className="mt-[12px] h-[24px] w-[1/2] border-2 border-solid border-white bg-[#343A3F] px-[4px] focus:outline-none"
                      placeholder="Enter Hex Code (with #)"
                      value={upsertCourse.color}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-[20px]">
                  <h1 className="font-semibold">Course Image</h1>
                  <input
                    className="mt-[8px] h-[24px] w-[1/2] border-2 border-solid border-white bg-[#343A3F] px-[4px] focus:outline-none"
                    type="text"
                    name="image"
                    placeholder="Enter Image URL"
                    onChange={handleChange}
                    value={upsertCourse.image}
                  />
                  <button
                    type="button"
                    className="ml-[16px] border-[1px] border-solid border-white px-[8px] py-[2px] text-[16px] font-semibold"
                    onClick={handlePreview}
                  >
                    {!showPreview && <h1> Preview URL Image</h1>}
                    {showPreview && <h1> Hide URL Image</h1>}
                  </button>

                  {renderImage()}
                </div>

                <h1 className="mt-[24px] font-semibold">Published?</h1>
                <label className="relative mt-[12px] inline-flex cursor-pointer items-center">
                  <input
                    id="switch"
                    type="checkbox"
                    className="peer sr-only"
                    onChange={handleChange}
                    checked={upsertCourse.flags.published}
                    name="flags.published"
                  />
                  <label htmlFor="switch" className="hidden"></label>
                  <div className="peer h-6 w-11 rounded-full border-[2px] border-solid bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#CFBA92] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300" />
                </label>

                <h1 className="mb-[16px] mt-[8px] text-[24px] font-semibold">
                  Modes
                </h1>

                <div className="mr-[16px] flex">
                  <div>
                    <h1 className="font-semibold">Exam</h1>
                    <label className="relative mt-[8px] inline-flex cursor-pointer items-center">
                      <input
                        id="switch"
                        name="studyModes"
                        data-mode="EXAM"
                        type="checkbox"
                        className="peer sr-only"
                        onChange={handleChange}
                        checked={upsertCourse.studyModes.includes("EXAM")}
                      />
                      <label htmlFor="switch" className="hidden"></label>
                      <div className="peer h-6 w-11 rounded-full border-[2px] border-solid bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#CFBA92] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300" />
                    </label>
                  </div>

                  <div className="ml-[24px] flex flex-col items-center">
                    <h1 className="font-semibold">Timed Exam</h1>
                    <label className="relative mt-[8px] inline-flex cursor-pointer items-center">
                      <input
                        id="switch"
                        name="studyModes"
                        data-mode="TIMED_EXAM"
                        type="checkbox"
                        className="peer sr-only"
                        onChange={handleChange}
                        checked={upsertCourse.studyModes.includes("TIMED_EXAM")}
                      />
                      <label htmlFor="switch" className="hidden"></label>
                      <div className="peer h-6 w-11 rounded-full border-[2px] border-solid bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#CFBA92] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300" />
                    </label>
                  </div>

                  <div className="ml-[40px]">
                    <h1 className="font-semibold">Topic</h1>
                    <label className="relative mt-[8px] inline-flex cursor-pointer items-center">
                      <input
                        id="switch"
                        name="studyModes"
                        data-mode="TOPIC"
                        type="checkbox"
                        className="peer sr-only"
                        onChange={handleChange}
                        checked={upsertCourse.studyModes.includes("TOPIC")}
                      />
                      <label htmlFor="switch" className="hidden"></label>
                      <div className="peer h-6 w-11 rounded-full border-[2px] border-solid bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#CFBA92] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300" />
                    </label>
                  </div>
                </div>

                <div className="mt-[40px] flex">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="mr-[16px] border-[1px] border-solid border-white px-[8px] py-[2px] text-[16px] font-semibold"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mr-[16px] border-[1px] border-solid border-white px-[8px] py-[2px] text-[16px] font-semibold"
                  >
                    Reset
                  </button>
                </div>

                {submissionStatus ===
                  "One or more fields is blank, please try again" && (
                  <h1 className="mt-[12px] font-semibold text-[#cc3300]">
                    {submissionStatus}{" "}
                    <button
                      className="underline"
                      onClick={() => {
                        setsubmissionStatus("");
                      }}
                    >
                      {" "}
                      Click here to dismiss
                    </button>
                  </h1>
                )}

                {submissionStatus === "Success!" && (
                  <h1 className="mt-[12px] font-semibold text-[#5cb85c]">
                    {submissionStatus}{" "}
                    <button
                      className="underline"
                      onClick={() => {
                        setsubmissionStatus("");
                      }}
                    >
                      {" "}
                      Click here to dismiss
                    </button>
                  </h1>
                )}
              </form>
            </div>
          </div>
        </div>
        <div className="relative py-[4.5rem] lg:w-1/2 lg:border-r-[2px] lg:border-dotted lg:border-r-gray-600">
          <h1 className="top-24 w-full text-center text-[36px] font-semibold text-white lg:absolute">
            Preview Mode
          </h1>

          {JSON.stringify(upsertCourse) === JSON.stringify(initialState) && (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div className="w-[60%] text-center">
                <h1 className="text-[36px] font-semibold">View Preview Here</h1>
                <h1 className="text-[16px]">
                  As you keep filling in information, this preview should
                  automatically start updating to look like what the module
                  might look like on the website.
                </h1>
              </div>
            </div>
          )}

          {JSON.stringify(upsertCourse) !== JSON.stringify(initialState) && (
            <div className="flex h-full w-full items-center justify-center">
              <div
                className="group relative aspect-[2.5/2] w-[45%] rounded-3xl hover:cursor-pointer hover:bg-transparent"
                style={{ backgroundColor: upsertCourse.color }}
              >
                <div
                  id="background-MA16200"
                  className="relative flex aspect-[2.5/2] select-none flex-col items-center justify-center gap-3 rounded-3xl text-center font-bold text-white opacity-100 transition-all duration-300 group-hover:opacity-0"
                >
                  <div
                    className="absolute left-0 top-0 h-full w-full rounded-3xl"
                    style={{
                      backgroundColor: darkenColor(upsertCourse.color, 0.8),
                      maskImage: `url(${upsertCourse.image})`,
                      maskSize: "cover",
                      maskPosition: "center center",
                    }}
                  ></div>
                  <h1 className="HUGE:text-8xl z-10 text-2xl xl:text-3xl">
                    {upsertCourse.abbreviation.toUpperCase()}{" "}
                    {upsertCourse.number !== 0 && upsertCourse.number}
                  </h1>
                  <h2 className="HUGE:text-4xl z-10 max-w-[90%] text-xl opacity-75 xl:text-lg">
                    {courseName}
                  </h2>
                </div>
                <div className="absolute left-0 top-0 grid aspect-[2.5/2] h-full w-full select-none place-items-center rounded-3xl text-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <div className="grid h-full w-full grid-cols-2 grid-rows-2">
                    <a
                      className="md:hover:text-light-gray flex h-full w-full flex-col items-center justify-center p-2 text-center text-white transition-all duration-150"
                      style={{
                        border: `3px solid ${darkenColor(upsertCourse.color, 0.8)}`,
                        borderRadius: "1.5rem 0px 0px",
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fas"
                        data-icon="vial"
                        className={`svg-inline--fa fa-vial HUGE:h-16 HUGE:w-16 mx-auto h-8 w-8 ${upsertCourse.studyModes.includes("TOPIC") ? "text-white" : "text-gray-400"}`}
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="currentColor"
                          d="M342.6 9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4L28.1 342.6C10.1 360.6 0 385 0 410.5L0 416c0 53 43 96 96 96l5.5 0c25.5 0 49.9-10.1 67.9-28.1L448 205.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-32-32-96-96-32-32zM205.3 256L352 109.3 402.7 160l-96 96-101.5 0z"
                        ></path>
                      </svg>

                      <h1
                        className={`HUGE:pt-2 HUGE:text-3xl ${upsertCourse.studyModes.includes("TOPIC") ? "text-white" : "text-gray-400"}`}
                      >
                        Study by Topic
                      </h1>
                    </a>
                    <a
                      className="md:hover:text-light-gray flex h-full w-full flex-col items-center justify-center p-2 text-center text-white transition-all duration-150"
                      style={{
                        border: `3px solid ${darkenColor(upsertCourse.color, 0.8)}`,
                        borderRadius: "0px 1.5rem 0px 0px",
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fas"
                        data-icon="scroll"
                        className={`svg-inline--fa fa-scroll HUGE:h-16 HUGE:w-16 mx-auto h-8 w-8 ${upsertCourse.studyModes.includes("EXAM") ? "text-white" : "text-gray-400"}`}
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                      >
                        <path
                          fill="currentColor"
                          d="M0 80l0 48c0 17.7 14.3 32 32 32l16 0 48 0 0-80c0-26.5-21.5-48-48-48S0 53.5 0 80zM112 32c10 13.4 16 30 16 48l0 304c0 35.3 28.7 64 64 64s64-28.7 64-64l0-5.3c0-32.4 26.3-58.7 58.7-58.7L480 320l0-192c0-53-43-96-96-96L112 32zM464 480c61.9 0 112-50.1 112-112c0-8.8-7.2-16-16-16l-245.3 0c-14.7 0-26.7 11.9-26.7 26.7l0 5.3c0 53-43 96-96 96l176 0 96 0z"
                        ></path>
                      </svg>

                      <h1
                        className={`HUGE:pt-2 HUGE:text-3xl ${upsertCourse.studyModes.includes("EXAM") ? "text-white" : "text-gray-400"}`}
                      >
                        Study by Exam
                      </h1>
                    </a>
                    <button
                      type="button"
                      className="focus-visible:ring-ring text-primary-foreground hover:bg-primary/90 absolute left-1/2 top-1/2 inline-flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full border-4 border-white bg-white px-4 py-2 text-sm font-medium opacity-0 shadow transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 group-hover:bg-white group-hover:opacity-100"
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fas"
                        data-icon="thumbtack"
                        className="svg-inline--fa fa-thumbtack"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        color="black"
                      >
                        <path
                          fill="currentColor"
                          d="M32 32C32 14.3 46.3 0 64 0L320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-29.5 0 11.4 148.2c36.7 19.9 65.7 53.2 79.5 94.7l1 3c3.3 9.8 1.6 20.5-4.4 28.8s-15.7 13.3-26 13.3L32 352c-10.3 0-19.9-4.9-26-13.3s-7.7-19.1-4.4-28.8l1-3c13.8-41.5 42.8-74.8 79.5-94.7L93.5 64 64 64C46.3 64 32 49.7 32 32zM160 384l64 0 0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96z"
                        ></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="md:hover:text-light-gray flex h-full w-full flex-col items-center justify-center rounded-none rounded-bl-3xl p-2 text-center text-white transition-all duration-150"
                      style={{
                        border: `3px solid ${darkenColor(upsertCourse.color, 0.8)}`,
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fas"
                        data-icon="stopwatch"
                        className={`svg-inline--fa fa-stopwatch HUGE:h-16 HUGE:w-16 mx-auto h-8 w-8 ${upsertCourse.studyModes.includes("TIMED_EXAM") ? "text-white" : "text-gray-400"}`}
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M176 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l16 0 0 34.4C92.3 113.8 16 200 16 304c0 114.9 93.1 208 208 208s208-93.1 208-208c0-41.8-12.3-80.7-33.5-113.2l24.1-24.1c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L355.7 143c-28.1-23-62.2-38.8-99.7-44.6L256 64l16 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L224 0 176 0zm72 192l0 128c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-128c0-13.3 10.7-24 24-24s24 10.7 24 24z"
                        ></path>
                      </svg>

                      <h1
                        className={`HUGE:pt-2 HUGE:text-3xl ${upsertCourse.studyModes.includes("TIMED_EXAM") ? "text-white" : "text-gray-400"}`}
                      >
                        Start Timed Exam
                      </h1>
                    </button>
                    <a
                      className="md:hover:text-light-gray flex h-full w-full flex-col items-center justify-center rounded-br-3xl p-2 text-center text-white transition-all duration-150"
                      style={{
                        border: `3px solid ${darkenColor(upsertCourse.color, 0.8)}`,
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fas"
                        data-icon="book-open-reader"
                        className="svg-inline--fa fa-book-open-reader HUGE:h-16 HUGE:w-16 mx-auto h-8 w-8"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="currentColor"
                          d="M160 96a96 96 0 1 1 192 0A96 96 0 1 1 160 96zm80 152l0 264-48.4-24.2c-20.9-10.4-43.5-17-66.8-19.3l-96-9.6C12.5 457.2 0 443.5 0 427L0 224c0-17.7 14.3-32 32-32l30.3 0c63.6 0 125.6 19.6 177.7 56zm32 264l0-264c52.1-36.4 114.1-56 177.7-56l30.3 0c17.7 0 32 14.3 32 32l0 203c0 16.4-12.5 30.2-28.8 31.8l-96 9.6c-23.2 2.3-45.9 8.9-66.8 19.3L272 512z"
                        ></path>
                      </svg>
                      <h1 className="HUGE:pt-2 HUGE:text-3xl">Resources</h1>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
