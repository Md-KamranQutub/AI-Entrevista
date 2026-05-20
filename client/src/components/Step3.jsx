import React from "react";
import { FaArrowCircleLeft, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import jsPdf, { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { current } from "@reduxjs/toolkit";

const Step3 = ({ report }) => {
  if (!report) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-green-500 font-medium">Loading... </p>
      </div>
    );
  }
  const navigate = useNavigate();
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((sc, index) => ({
    name: `Q${index + 1}`,
    score: sc.score || 0,
  }));

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let perfomanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    perfomanceText = "Ready for Job Opportunities";
    shortTagline = "Excelent clarity and structured response.";
  } else if (finalScore >= 5) {
    perfomanceText = "Needs minor improvement before interview.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    perfomanceText = "Significant improvement required.";
    shortTagline = "Work on clartity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const downloadPdf = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20
    const contentWidth = pageWidth - margin * 2;

    let currentY = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);
    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, { align: "center" });

    currentY += 5;

    doc.setDrawColor(34, 197, 94);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    currentY += 15;

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0)
    doc.text(
      `Final Score ${finalScore}/10`,
      pageWidth / 2,
      currentY + 12,
      { align: "center" }
    )

    currentY += 30

    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");

    doc.setFontSize(12);

    doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
    doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
    doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

    currentY += 45

    let advice = "";

    if (finalScore >= 8) {
      advice = "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples."
    }
    else if (finalScore >= 5) {
      advice = "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger support examples."
    }
    else {
      advice = "Significant improvement required. Focus on structured thinking clarity, and confident delivery. Practice answering aloud regularly."
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220);
    doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

    doc.setFont("helvetica", "bold")
    doc.text("Professional Advice", margin + 10, currentY + 10)

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
    doc.text(splitAdvice, margin + 10, currentY + 20);

    currentY += 50;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question,
        `${q.score}/10`,
        q.feedback || "No Feedback available for this question.",
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 5,
        valign: "top",
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        halign: "center"
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 55 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: "auto" },
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    doc.save("AI_Interview_Report.pdf");
  }

  return (
    <div className="md:px-6 md:py-4 p-4 space-y-8">
      <div className="headings flex flex-col md:flex-row gap-6 items-center md:justify-between  ">
        <div className="flex md:gap-6 items-center gap-10">
          <div className="arrow bg-white rounded-full p-1 cursor-pointer shadow-xl inset-shadow-gray-300 ">
            <FaArrowLeft
              onClick={() => navigate("/history")}
              className="p-1"
              size={30}
            />
          </div>
          <div className="headingshow flex flex-col gap-1">
            <h2 className="text-lg text-center md:text-2xl font-medium md:font-bold">
              Interview Analytics Dashboard
            </h2>
            <p className="text-sm text-gray-500">
              AI powered performance insights
            </p>
          </div>
        </div>
        <div>
          <motion.button
            onClick={downloadPdf}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer py-2 px-6 font-medium bg-green-500 rounded-lg text-white"
          >
            Download Pdf
          </motion.button>
        </div>
      </div>

      <div className="chart lg:col-span-2 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">
            Performance Trend
          </h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={questionScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#22c55e" fill="#bbf7d0" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      <div className="second flex w-full justify-around flex-col md:flex-row">
        <div className="overall-performance my-6 bg-white rounded-2xl md:px-20 md:py-8 px-10 py-5 shadow-2xl shadow-gray-300 border-2 border-gray-200">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 items-center"
          >
            <p className="text-gray-500 ">Overall Performance</p>
            <div className="circular-react">
              <CircularProgressbar
                className="h-20 w-20 md:h-30 md:w-30"
                styles={buildStyles({
                  trailColor: "#f1f1f1",
                  textColor: "#39c087",
                  pathColor: "#39c087",
                })}
                value={(finalScore / 10) * 100}
                text={`${finalScore}/10`}
              />
            </div>
            <p className="font-medium">{perfomanceText}</p>
            <p className="text-sm text-gray-500">{shortTagline}</p>
          </motion.div>
        </div>
        <div className="skill-evaluation bg-white rounded-2xl shadow-2xl shadow-gray-300 border-gray-200 px-4">
          <motion.div className="flex flex-col justify-evenly mt-10 gap-4">
            <p className="font-medium">Skill Evaluation</p>
            <div className="skills space-y-3">
              {skills.map((skill, index) => {
                return <div>
                  <div className="score flex justify-between">
                    <p className="font-medium">{skill.label}</p>
                    <p className="font-bold text-green-500">{confidence}</p>
                  </div>
                  <div className="h-4 rounded-full bg-gray-200 w-80 md:w-100">
                    <div className="h-4  rounded-full bg-green-500" style={{ width: `${skill.value * 10}%` }}></div>
                  </div>
                </div>
              })}
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="question-wise-breakdown bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8">
        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-6">
          Question Breakdown
        </h3>
        <div className="space-y-6">
          {questionWiseScore.map((q, index) => {
            return <div key={index} className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2xl border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Quesiton {index + 1}</p>
                  <p className="font-semibold text-gray-800 text-sm sm:text-base leading-relaxed">{q.question || "Question not available"}</p>
                </div>
                <div className="bg-green-100 text-green-500 px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit">
                  {q.score ?? 0}/10
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-xs text-green-500 font-semibold mb-1">AI Feedback</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {q.feedback && q.feedback.trim() !== "" ? q.feedback : "No feedback available for this question."}
                </p>
              </div>
            </div>
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Step3;
