import '../../css/HOME/privacy.css'

function Privacy() {
    return (
        <>
            <div className="privacy-container">
                <h2>Privacy Statement</h2>

                <article className="personal-data">
                    <h3>Personal data that we process</h3>
                    <p>Zastra processes your personal data because you have provided it to us and/or because you use our
                        services. Below is an overview of the personal data we process:
                        <ul>
                            <li>Official ID number</li>
                            <li>First and last name</li>
                            <li> Phone number</li>
                            <li> Email address</li>
                        </ul>
                    </p>
                </article>

                <article className="sensitive-data">
                    <h3>Special and/or sensitive personal data</h3>
                    <p>We work exclusively with your company data and do not record any special and/or sensitive
                        personal data.</p>
                </article>

                <article className="data-collection">
                    <h3>Why is this data collected?</h3>
                    <p>Zastra processes your data to answer questions you submit through our support channel, but also
                        to contact you later if developments on the relevant topic warrant it. Zastra also collects
                        your data to contact you if this is necessary or desirable for our services. When you subscribe
                        to
                        OpenGemeenten newsletters, you grant us permission to use your personal data. We use this data
                        solely to send the newsletters. Each newsletter contains a link you can use to unsubscribe and
                        withdraw your consent.</p>
                </article>

                <article className="data-security">
                    <h3>Security</h3>
                    <p>Zastra takes the protection of your personal data seriously and has therefore taken appropriate
                        measures to prevent misuse, loss, unauthorized access, unwanted disclosure, and unauthorized
                        modification. If you nevertheless suspect that your data is not properly secured or if there are
                        indications of misuse, please contact our service desk at <a
                            href="#">support@Zastra.nl</a> (Refers to an
                        email address).</p>
                </article>

                <article className="data-save-termine">
                    <h3>Retention Period</h3>
                    <p>Zastra will not retain your personal data longer than is strictly necessary to achieve the
                        purposes for which your data was collected. For example, if you change jobs and are no longer a
                        contact person, we will delete your data from our system as soon as we become aware of this.</p>
                </article>

                <article className="data-sharing">
                    <h3>Share with others</h3>
                    <p>Zastra shares your personal data with third parties if this is necessary for the execution of
                        the agreement. We have data processing agreements in place with companies that process your data
                        on
                        our behalf to ensure the same level of security and confidentiality of your data. SimplyAdmire
                        remains responsible for these processing operations. We do not provide personal data to third
                        parties unless we have received your consent.</p>
                </article>

                <article className="cookies">
                    <h3>Cookies</h3>
                    <p>Zastra uses only functional cookies. A cookie is a small text file that is stored on your
                        computer, tablet, or smartphone when you first visit this website. These cookies are necessary
                        for
                        the technical operation of the website. For statistics, we use self-hosted Matomo.</p>
                </article>

                <article className="data-editing">
                    <h3>View, change or delete data</h3>
                    <p>You have the right to access, correct, or delete your personal data. You can send a request for
                        access, correction, or deletion to <a href="#">support@Zastra.nl</a></p>
                </article>
            </div>
        </>
    )
}

export default Privacy;
