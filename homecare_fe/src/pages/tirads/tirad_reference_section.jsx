import React from "react";
import "./tirad.css";

const TiradsReferenceSection = () => {
  return (
    <div className="tirads-reference">
      <div className="tirads-description">
        <h2>What does TIRADS stand for?</h2>
        <p>
          TIRADS (Thyroid Imaging Reporting and Data System) is a 5-point
          scoring system for thyroid nodules on ultrasound, developed by the{" "}
          <a href="https://www.acr.org/">American College of Radiology</a>. It
          helps to decide if a thyroid nodule is benign or malignant by
          combining multiple features on ultrasound.
        </p>

        <h3>
          How to calculate TIRADS score for thyroid nodules using this
          Calculator?
        </h3>
        <ul className="tirads-description-list left-align">
          <li>
            Step #1: Perform the ultrasound as per the guidelines. Read the{" "}
            <a href="https://pubs.rsna.org/doi/pdf/10.1148/radiol.12120637">
              whitepaper
            </a>{" "}
            and the simplified{" "}
            <a href="https://www.acr.org/-/media/ACR/Files/Clinical-Resources/TIRADS/TIRADS_White_Paper.pdf">
              TIRADS article
            </a>{" "}
            thoroughly. You can use the{" "}
            <a href="https://www.acr.org/-/media/ACR/Files/Clinical-Resources/TIRADS/Worksheet.pdf">
              sonographer’s worksheet
            </a>{" "}
            to document all the findings.
          </li>
          <li>
            Step #2: Select the appropriate categories in the tirads calculator
            above.
          </li>
          <li>
            Step #3: Check the total score and recommendations per the thyroid
            chart at the bottom of the <a href="#">TI-RADS</a> calculator.
          </li>
          <li>
            Step #4: Use the{" "}
            <a href="https://www.acr.org/-/media/ACR/Files/Clinical-Resources/TIRADS/Template.docx">
              ultrasound reporting template
            </a>{" "}
            to generate the report.
          </li>
          <li>
            Step #5: Suggest recommendations for follow-up ultrasound or Fine
            Needle Aspiration Cytology (FNAC) depending on the TIRADS category.
          </li>
        </ul>
      </div>
      <h2 className="reference-title">TIRADS Classification Table</h2>
      <table className="reference-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Points</th>
            <th>Suspicion</th>
            <th>Risk of Malignancy</th>
            <th>Guideline</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>TR1</td>
            <td>0</td>
            <td>Lành tính</td>
            <td>0.3%</td>
            <td>Không FNA</td>
          </tr>
          <tr>
            <td>TR2</td>
            <td>2</td>
            <td>Không nghi ngờ</td>
            <td>1.5%</td>
            <td>Không FNA</td>
          </tr>
          <tr>
            <td>TR3</td>
            <td>3</td>
            <td>Nghi ngờ thấp</td>
            <td>4.8%</td>
            <td>FNA nếu ≥ 2.5cm; Theo dõi nếu ≥ 1.5cm</td>
          </tr>
          <tr>
            <td>TR4</td>
            <td>4 - 6</td>
            <td>Nghi ngờ vừa</td>
            <td>9.1%</td>
            <td>FNA nếu ≥ 1.5cm; Theo dõi nếu ≥ 1cm</td>
          </tr>
          <tr>
            <td>TR5</td>
            <td>≥ 7</td>
            <td>Nghi ngờ cao</td>
            <td>35%</td>
            <td>FNA nếu ≥ 1cm; Theo dõi nếu ≥ 0.5cm hàng năm trong 5 năm</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TiradsReferenceSection;
