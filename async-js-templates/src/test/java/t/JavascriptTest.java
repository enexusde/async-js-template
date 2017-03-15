package t;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.channels.ReadableByteChannel;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.apache.tools.ant.Project;
import org.apache.tools.ant.ProjectHelper;
import org.apache.tools.ant.taskdefs.Sleep;
import org.apache.tools.ant.types.resources.FileResource;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.util.resource.Resource;
import org.eclipse.jetty.webapp.WebAppContext;

import com.canoo.webtest.ant.TestStepSequence;
import com.canoo.webtest.ant.WebtestTask;
import com.canoo.webtest.engine.Configuration;
import com.canoo.webtest.steps.control.RetryStep;
import com.canoo.webtest.steps.form.SetCheckbox;
import com.canoo.webtest.steps.form.SetInputField;
import com.canoo.webtest.steps.form.SetSelectField;
import com.canoo.webtest.steps.request.ClickElement;
import com.canoo.webtest.steps.request.InvokePage;
import com.canoo.webtest.steps.verify.VerifyInputField;
import com.canoo.webtest.steps.verify.VerifyText;
import com.canoo.webtest.steps.verify.VerifyXPath;

public class JavascriptTest {
	private static final String JS_ASJST_JS = "/js/asjst.js";
	private static final File FILE = new File("src/main/resources/META-INF/resources" + JS_ASJST_JS);
	public Server server;
	public Project project;

	public void testAsjst() throws Exception {
		ExecutorService s = Executors.newScheduledThreadPool(2);
		s.submit(new Runnable() {
			public void run() {
				Server server = new Server(8081);
				ResourceHandler handler = new ResourceHandler() {
					@Override
					public Resource getResource(String path) {
						if (path.equals(JS_ASJST_JS)) {
							return new org.eclipse.jetty.util.resource.FileResource(FILE);
						}
						if(path.equals("/data/user/2.js")){
							System.out.println("2 start");
							try {
								Thread.sleep(50);
							} catch (InterruptedException e) {
								e.printStackTrace();
							}
							System.out.println("2 stop");
						}
						if(path.equals("/data/user/5.js")){
							System.out.println("5 start");
							try {
								Thread.sleep(50);
							} catch (InterruptedException e) {
								e.printStackTrace();
							}
							System.out.println("5 stop");
						}
						if(path.startsWith("/log")){
							System.out.println("                     ("+path+")");
						}
						return super.getResource(path);
					}
				};
				handler.setResourceBase("src/main/webapp");
				server.setHandler(handler);
				try {
					server.start();
					JavascriptTest.this.server = server;
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
		s.submit(new Runnable() {
			public void run() {
				Project project = new Project();
				project.init();
				project.addTaskDefinition("webtest", WebtestTask.class);
				project.addTaskDefinition("config", Configuration.class);
				project.addTaskDefinition("invoke", InvokePage.class);
				project.addTaskDefinition("steps", TestStepSequence.class);
				project.addTaskDefinition("setInputField", SetInputField.class);
				project.addTaskDefinition("clickElement", ClickElement.class);
				project.addTaskDefinition("setSelectField", SetSelectField.class);
				project.addTaskDefinition("verifyInputField", VerifyInputField.class);
				project.addTaskDefinition("sleep", Sleep.class);
				project.addTaskDefinition("retry", RetryStep.class);
				project.addTaskDefinition("verifyXPath", VerifyXPath.class);
				project.addTaskDefinition("setCheckbox", SetCheckbox.class);
				ProjectHelper.configureProject(project, new File("src/main/webapp/javascriptTest.xml"));
				JavascriptTest.this.project = project;
			}
		});
		s.shutdown();
		s.awaitTermination(10, TimeUnit.SECONDS);

		try {
			project.executeTarget(project.getDefaultTarget());
		} finally {
			server.stop();
		}
	}
}
