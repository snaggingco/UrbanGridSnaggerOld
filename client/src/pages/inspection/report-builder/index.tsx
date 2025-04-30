import { Route, Switch } from "wouter";
import { TemplateSelection } from "./TemplateSelection";
import { TemplateEditor } from "./TemplateEditor";

export default function ReportBuilderRoutes() {
  return (
    <Switch>
      <Route path="/inspection/report-builder" component={TemplateSelection} />
      <Route path="/inspection/report-builder/edit/:templateId" component={TemplateEditor} />
    </Switch>
  );
}